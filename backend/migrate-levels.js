require('dotenv').config();
const mongoose = require('mongoose');
const VivaResult = require('./models/VivaResult');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const results = await VivaResult.find({});
  let updated = 0;

  for (const r of results) {
    let level = 'Average';
    if (r.percentage >= 75) level = 'Excellent';
    else if (r.percentage >= 50) level = 'Good';

    if (r.performanceLevel !== level) {
      // Use updateOne with $set — bypass enum validation on old values
      await VivaResult.collection.updateOne(
        { _id: r._id },
        { $set: { performanceLevel: level } }
      );
      console.log(`  Fixed: ${r.percentage}% | ${r.performanceLevel} → ${level}`);
      updated++;
    }
  }

  console.log(`\nMigration complete. Updated ${updated} of ${results.length} results.`);
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
