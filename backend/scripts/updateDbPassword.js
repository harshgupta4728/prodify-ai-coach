// Run after changing the database user's password in MongoDB Atlas:
//
//   cd backend
//   npm run update-db-password
//
// It asks for the new password and your login email, checks that the password works,
// updates backend/.env, and writes the values to paste into Render to
// local-only/RENDER-VALUES-delete-after-use.txt (git-ignored). Nothing changes if the
// password is wrong.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline/promises');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '..', '.env');
const renderValuesPath = path.join(__dirname, '..', '..', 'local-only', 'RENDER-VALUES-delete-after-use.txt');
// The live site's data is in the database called "test" (MongoDB's default, because the
// original connection string had no database name). Local development uses its own.
const PRODUCTION_DB = 'test';
const URI_PATTERN = /^(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@]*)@([^/]+)\/([^?]*)(\?.*)?$/;

const getVar = (env, name) => (env.match(new RegExp(`^${name}=(.*)$`, 'm')) || [])[1];
const setVar = (env, name, value) => {
  const line = `${name}=${value}`;
  if (new RegExp(`^${name}=`, 'm').test(env)) return env.replace(new RegExp(`^${name}=.*$`, 'm'), line);
  return `${env.replace(/\s*$/, '')}\n${line}\n`;
};

async function canConnect(uri) {
  // Atlas takes up to a minute to apply a password change, so retry a few times
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      await mongoose.connection.db.admin().ping();
      await mongoose.disconnect();
      return true;
    } catch (error) {
      await mongoose.disconnect().catch(() => {});
      if (attempt < 4) {
        console.log(`  Not accepted yet (${error.message.split('.')[0]}). Retrying in 15 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    }
  }
  return false;
}

async function main() {
  const env = fs.readFileSync(envPath, 'utf8');
  const match = (getVar(env, 'MONGODB_URI') || '').trim().match(URI_PATTERN);
  if (!match) {
    console.error('Could not read MONGODB_URI from backend/.env.');
    process.exit(1);
  }
  const [, scheme, user, , hosts, localDb, query = ''] = match;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const password = (await rl.question(`New Atlas password for database user "${decodeURIComponent(user)}": `)).trim();
  const currentAdmins = getVar(env, 'ADMIN_EMAILS') || '';
  const adminAnswer = (await rl.question(
    `Email you log in to Prodify with (gets admin access)${currentAdmins ? ` [${currentAdmins}]` : ''}: `
  )).trim().toLowerCase();
  rl.close();

  if (!password) {
    console.error('No password entered. Nothing was changed.');
    process.exit(1);
  }
  const adminEmails = adminAnswer || currentAdmins;

  const buildUri = (db) => `${scheme}${user}:${encodeURIComponent(password)}@${hosts}/${db}${query}`;
  const localUri = buildUri(localDb);
  const productionUri = buildUri(PRODUCTION_DB);

  console.log('Checking the new password with MongoDB Atlas...');
  if (!(await canConnect(localUri))) {
    console.error('\nThe new password did not work, so nothing was changed.');
    console.error('Check that you copied the whole password and clicked "Update User" in Atlas, then run this again.');
    process.exit(1);
  }

  let updated = setVar(env, 'MONGODB_URI', localUri);
  if (adminEmails) updated = setVar(updated, 'ADMIN_EMAILS', adminEmails);
  fs.writeFileSync(envPath, updated);

  const lines = [
    'Paste these into Render: dashboard.render.com > your backend service > Environment.',
    'Edit the ones that already exist, add the missing ones, then save and deploy.',
    'Delete this file when you are done: it contains passwords.',
    '',
    `MONGODB_URI=${productionUri}`,
    `JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`,
  ];
  if (adminEmails) lines.push(`ADMIN_EMAILS=${adminEmails}`);
  fs.mkdirSync(path.dirname(renderValuesPath), { recursive: true });
  fs.writeFileSync(renderValuesPath, `${lines.join('\n')}\n`);

  console.log('\nDone:');
  console.log('  - The password works, and backend/.env now uses it.');
  console.log(`  - The values for Render are in: ${renderValuesPath}`);
  console.log('\nNext: copy those values into Render (see the steps you were given), then delete that file.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
