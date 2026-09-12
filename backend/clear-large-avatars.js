import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI;

async function clearLargeAvatars() {
  try {
    await mongoose.connect(mongoUri);
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // We can't fetch all users with their avatars into memory, it will crash.
    // Instead, we fetch them and check avatar string length.
    // Wait, if we use cursor, it might still crash if one document is 50MB.
    // Actually, we can use MongoDB aggregation to find documents where avatar.data string length is > 1000000.
    
    console.log('Finding users with large avatars...');
    const result = await User.updateMany(
      { $expr: { $gt: [{ $strLenCP: { $ifNull: ["$avatar.data", ""] } }, 1000000] } },
      { $unset: { avatar: 1 } }
    );
    
    console.log('Cleared large avatars:', result);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

clearLargeAvatars();
