// Checks that the main backend features still work, using your LOCAL practice database.
// Run it after making changes:
//
//   cd backend
//   npm run smoke-test
//   npm run smoke-test -- --verbose    (also prints the server's log)
//
// It starts a temporary server, signs up a throwaway user (reading the OTP from the
// server's console), goes through the main features, then deletes that user again.
// It refuses to run against the live database.
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const PORT = 10950;
const BASE = `http://localhost:${PORT}/api`;
// The live site uses the database "test" (also what an empty database name means)
const LIVE_DATABASES = ['', 'test'];

const dbName = ((process.env.MONGODB_URI || '').match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/) || [])[1];
if (dbName === undefined || LIVE_DATABASES.includes(dbName)) {
  console.error('Refusing to run: backend/.env points at the live database.');
  console.error('Set MONGODB_URI to a practice database (for example .../prodify_dev?...).');
  process.exit(1);
}

let serverOutput = '';
let failures = 0;
let warnings = 0;
const pass = (name, ok, detail = '') => {
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${!ok && detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
  return ok;
};
const warn = (name, detail) => {
  console.log(`  ! ${name}  (${detail})`);
  warnings++;
};

const call = async (method, url, { token, body } = {}) => {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};

const waitFor = async (predicate, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
};

async function run(email) {
  const password = `Smoke-${crypto.randomBytes(6).toString('hex')}`;
  let token;

  // ---- Accounts ----
  const health = await call('GET', '/health');
  pass('server is up and connected to the database', health.status === 200 && health.data?.database === 'connected');

  const sent = await call('POST', '/auth/send-otp', { body: { email, purpose: 'signup' } });
  pass('sign-up code can be requested', sent.status === 200, sent.data?.error);
  const otp = await waitFor(() => {
    const line = serverOutput.split('\n').find((l) => l.includes(`to: ${email}`) && l.includes('subject: Prodify - Verify'));
    return line && (line.match(/\b(\d{6})\b/) || [])[1];
  }, 10000);
  if (!pass('sign-up code appears in the server console', Boolean(otp))) return;

  const wrong = await call('POST', '/auth/signup', { body: { name: 'Smoke Test', email, password, otp: otp === '000000' ? '111111' : '000000' } });
  pass('wrong sign-up code is rejected', wrong.status === 400);

  const signup = await call('POST', '/auth/signup', { body: { name: 'Smoke Test', email, password, otp } });
  token = signup.data?.token;
  if (!pass('sign-up works', signup.status === 201 && Boolean(token), signup.data?.error)) return;

  const login = await call('POST', '/auth/signin', { body: { email: email.toUpperCase(), password } });
  pass('login works (email in any letter case)', login.status === 200 && Boolean(login.data?.token), login.data?.error);
  token = login.data?.token || token;

  const badLogin = await call('POST', '/auth/signin', { body: { email, password: 'wrong-password' } });
  pass('wrong password is rejected', badLogin.status === 400);

  const me = await call('GET', '/auth/me', { token });
  pass('current user loads, without the password', me.status === 200 && me.data?.user?.email === email && !('password' in (me.data?.user || {})));

  const profile = await call('PUT', '/auth/profile', { token, body: { bio: 'Testing', portfolio: 'https://example.com' } });
  pass('profile can be updated', profile.status === 200 && profile.data?.user?.bio === 'Testing', profile.data?.error);
  const badLink = await call('PUT', '/auth/profile', { token, body: { portfolio: 'javascript:alert(1)' } });
  pass('unsafe portfolio link is rejected', badLink.status === 400);

  // ---- Planner ----
  const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const task = await call('POST', '/tasks', { token, body: { title: 'Smoke task', deadline, category: 'study', priority: 'medium', link: 'https://leetcode.com' } });
  pass('task can be created', task.status === 201, task.data?.error);
  const taskId = task.data?._id;
  if (taskId) {
    const moved = await call('PUT', `/tasks/${taskId}`, { token, body: { title: 'Renamed', userId: new mongoose.Types.ObjectId().toString() } });
    pass('task can be edited, but not moved to another user', moved.status === 200 && moved.data?.title === 'Renamed' && moved.data?.userId === me.data?.user?._id);
    const badTaskLink = await call('PUT', `/tasks/${taskId}`, { token, body: { link: 'javascript:alert(1)' } });
    pass('unsafe task link is rejected', badTaskLink.status === 400);
    const done = await call('PATCH', `/tasks/${taskId}/complete`, { token, body: { timeSpent: 5 } });
    pass('task can be completed', done.status === 200 && done.data?.completed === true);
    const removed = await call('DELETE', `/tasks/${taskId}`, { token });
    pass('task can be deleted', removed.status === 200);
  }

  // ---- Learning content and progress ----
  const topics = await call('GET', '/topics', { token });
  const topicList = Array.isArray(topics.data) ? topics.data : [];
  pass('topics load', topics.status === 200 && topicList.length > 0, topicList.length === 0 ? 'no topics: run npm run seed:topics -- --yes' : '');

  const today = await call('GET', '/progress/todays-problem', { token });
  const problemId = today.data?.todaysProblem?.problemId;
  pass("today's problem loads", today.status === 200 && Boolean(problemId), today.data?.message);

  if (problemId) {
    const solved = await call('POST', '/progress/mark-solved', { token, body: { problemId, solution: 'print(1)', language: 'python' } });
    pass('solving a problem raises the rating (first solve)', solved.status === 200 && solved.data?.progress?.currentRating > 1200, solved.data?.error);
    const again = await call('POST', '/progress/mark-solved', { token, body: { problemId, solution: 'print(2)', language: 'python' } });
    pass('solving it again does not raise it twice', again.status === 200 && again.data?.progress?.currentRating === solved.data?.progress?.currentRating);
  }

  const progress = await call('GET', '/progress', { token });
  pass('dashboard progress loads', progress.status === 200 && progress.data?.progress?.totalProblemsSolved >= (problemId ? 1 : 0));

  if (topicList[0]) {
    const quiz = await call('POST', '/progress/quiz-score', { token, body: { topicSlug: topicList[0].slug, score: 1, totalQuestions: 2 } });
    pass('quiz score can be saved', quiz.status === 200, quiz.data?.error);
    const subtopicId = topicList[0].subtopics?.[0]?._id;
    if (subtopicId) {
      const read = await call('PATCH', '/progress/article-read', { token, body: { topicSlug: topicList[0].slug, subtopicId } });
      pass('article can be marked as read', read.status === 200, read.data?.error);
    }
  }

  // ---- Permissions and email ----
  const adminOnly = await call('POST', '/topics', { token, body: { name: 'x', slug: 'smoke-should-not-exist' } });
  pass('normal users cannot change learning content', adminOnly.status === 403);

  const mail = await call('POST', '/send-email', { token, body: { subject: 'Smoke test reminder', body: 'Hello from the smoke test' } });
  const mailedSelf = await waitFor(() => serverOutput.includes(`to: ${email} | subject: Smoke test reminder`), 5000);
  pass('reminder email goes to the user themself', mail.status === 200 && Boolean(mailedSelf), mail.data?.error);

  const forged = await call('GET', '/auth/me', { token: 'not-a-real-token' });
  pass('fake login tokens are rejected', forged.status === 401);

  // ---- Code runner (uses an outside compiler service, so a failure is only a warning) ----
  try {
    const code = await call('POST', '/code/execute', { token, body: { language: 'python', code: 'print(2 + 3)' } });
    if (code.status === 200 && (code.data?.run?.stdout || '').trim() === '5') {
      pass('code runner works', true);
    } else {
      warn('code runner did not return the expected output', code.data?.error || `status ${code.status}`);
    }
  } catch (error) {
    warn('code runner could not be reached', error.message);
  }

  // ---- Clean up through the app itself ----
  const deleted = await call('DELETE', '/auth/account', { token });
  const gone = await call('GET', '/auth/me', { token });
  pass('account deletion works', deleted.status === 200 && gone.status === 401);
}

async function main() {
  console.log(`Smoke test against the practice database "${dbName}"\n`);
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    // Empty BREVO_API_KEY makes the server print emails (and the sign-up code) instead of sending them
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development', RENDER: '', BREVO_API_KEY: '', ADMIN_EMAILS: '' },
  });
  server.stdout.on('data', (chunk) => { serverOutput += chunk; });
  server.stderr.on('data', (chunk) => { serverOutput += chunk; });
  const stopServer = () => { if (!server.killed) server.kill(); };
  process.on('exit', stopServer);

  const email = `smoke-test-${crypto.randomBytes(4).toString('hex')}@example.com`;
  try {
    const started = await waitFor(() => serverOutput.includes('Server running on port') || server.exitCode !== null, 60000);
    if (!started || server.exitCode !== null) {
      console.error('The server did not start. Its output:\n' + serverOutput);
      process.exit(1);
    }
    await run(email);
  } catch (error) {
    pass('smoke test finished without crashing', false, error.message);
  } finally {
    stopServer();
    // Remove anything left behind if a step failed halfway
    {
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      const user = await db.collection('users').findOne({ email });
      if (user) {
        await Promise.all(['tasks', 'progresses', 'problems'].map((name) => db.collection(name).deleteMany({ userId: user._id })));
        await db.collection('users').deleteOne({ _id: user._id });
      }
      await db.collection('otps').deleteMany({ email });
      await mongoose.disconnect();
    }
  }

  console.log('');
  if (failures === 0) {
    console.log(`All checks passed${warnings ? ` (${warnings} warning${warnings === 1 ? '' : 's'})` : ''}.`);
  } else {
    console.log(`${failures} check(s) failed. Last server output:\n`);
    console.log(serverOutput.split('\n').slice(-40).join('\n'));
    process.exitCode = 1;
  }
  if (process.argv.includes('--verbose')) {
    console.log(`\n---- server log ----\n${serverOutput}`);
  }
}

main();
