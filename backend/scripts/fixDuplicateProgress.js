// Removes duplicate progress documents (created when a new user's first page load
// sent two requests at once), then adds the unique index that prevents new ones.
// For each affected user it keeps the document the app has been showing them, and it
// saves a backup of the affected documents to local-only/backups/ before deleting.
//
//   npm run fix:duplicate-progress                    # dry run on the database in backend/.env
//   npm run fix:duplicate-progress -- --live          # dry run on the live site's database
//   npm run fix:duplicate-progress -- --live --yes    # apply it on the live site's database
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');

const apply = process.argv.includes('--yes');
const live = process.argv.includes('--live');
const backupDir = path.join(__dirname, '..', '..', 'local-only', 'backups');
// The live site's data is in the database "test" (same cluster and user as backend/.env)
const LIVE_DB = 'test';

const summary = (doc) =>
  `${doc._id} (streak ${doc.currentStreak}, solved ${doc.totalProblemsSolved}, updated ${doc.updatedAt?.toISOString()})`;

async function main() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to backend/.env (see backend/.env.example).');
    process.exit(1);
  }
  if (live) {
    uri = uri.replace(/^(mongodb(?:\+srv)?:\/\/[^/]+)\/[^?]*/, `$1/${LIVE_DB}`);
  }
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.db.databaseName}${apply ? '' : ' (dry run)'}`);

  const groups = await Progress.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  console.log(`${groups.length} user(s) with duplicate progress documents`);

  if (apply && groups.length > 0) {
    const affected = await Progress.find({ userId: { $in: groups.map((group) => group._id) } }).lean();
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `progress-duplicates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(affected, null, 2));
    console.log(`Backed up ${affected.length} documents to ${backupFile}`);
  }

  for (const { _id: userId } of groups) {
    // Same lookup the app uses, so the user keeps seeing the same progress
    const kept = await Progress.findOne({ userId });
    const extras = await Progress.find({ userId, _id: { $ne: kept._id } });
    console.log(`user ${userId}: keep ${summary(kept)}`);
    extras.forEach((doc) => console.log(`  ${apply ? 'delete' : 'would delete'} ${summary(doc)}`));
    if (apply) {
      await Progress.deleteMany({ _id: { $in: extras.map((doc) => doc._id) } });
    }
  }

  // A plain (non-unique) userId index blocks creating the unique one, so it gets replaced
  const indexes = await Progress.collection.indexes();
  const plainIndex = indexes.find((index) => index.name === 'userId_1' && !index.unique);
  const uniqueIndex = indexes.find((index) => index.name === 'userId_1' && index.unique);
  if (plainIndex) {
    console.log(`${apply ? 'Replacing' : 'Would replace'} the non-unique userId_1 index with a unique one`);
  }

  if (apply) {
    if (plainIndex) {
      await Progress.collection.dropIndex('userId_1');
    }
    if (!uniqueIndex) {
      await Progress.collection.createIndex({ userId: 1 }, { unique: true });
    }
    console.log('Done. The unique index on progresses.userId is in place.');
  } else {
    console.log('Nothing changed. Add --yes to apply.');
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
