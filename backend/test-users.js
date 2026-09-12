import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI;

async function test() {
  try {
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected');
    
    // Import User model (dynamically to avoid paths issues if run from root, wait, I can just define the schema)
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    console.log('Running updateMany...');
    const res1 = await User.updateMany(
      { isSuspended: true, suspendedUntil: { $lte: new Date() } },
      { $set: { isSuspended: false, suspendedUntil: null } }
    );
    console.log('updateMany done:', res1);

    console.log('Running find...');
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    console.log('find done, users count:', users.length);

    const utcStart = new Date();
    utcStart.setUTCHours(0, 0, 0, 0);
    console.log('Running countDocuments...');
    const count = await User.countDocuments({ createdAt: { $gte: utcStart } });
    console.log('countDocuments done:', count);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

test();
