// Shared start-up for the seed scripts. Each one deletes collections before
// re-inserting, so it refuses to run without --yes and names the target cluster.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

module.exports = async function connectForSeeding(action) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to backend/.env (see backend/.env.example).');
    process.exit(1);
  }

  const target = uri.replace(/\/\/[^@]*@/, '//').split('?')[0];
  if (!process.argv.includes('--yes')) {
    console.error(`This will ${action} in:\n  ${target}\nRe-run with --yes to continue.`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${target}`);
};
