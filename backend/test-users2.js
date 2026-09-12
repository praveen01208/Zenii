import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI;

async function test() {
  try {
    await mongoose.connect(mongoUri);
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    console.log('Counting users...');
    const totalCount = await User.countDocuments();
    console.log('Total users:', totalCount);
    
    console.log('Finding 1 user...');
    const user1 = await User.findOne().lean();
    console.log('1 user:', user1);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

test();
