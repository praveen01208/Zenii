import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for import');

  const exportDir = path.join(__dirname, 'seedData');
  if (!fs.existsSync(exportDir)) {
    console.error('No seedData folder found. Run exportSeed.js first.');
    process.exit(1);
  }

  const files = fs.readdirSync(exportDir);
  
  for (let file of files) {
    if (!file.endsWith('.json')) continue;
    
    const collectionName = file.replace('.json', '');
    const filePath = path.join(exportDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.length === 0) {
      console.log(`Skipping empty collection: ${collectionName}`);
      continue;
    }

    const collection = mongoose.connection.db.collection(collectionName);
    
    // Clear existing data
    await collection.deleteMany({});
    
    // Convert string _id back to ObjectId
    const processedData = data.map(doc => {
      if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
        doc._id = new mongoose.Types.ObjectId(doc._id);
      }
      // Also convert user/therapist ObjectIds if they exist
      if (doc.user && typeof doc.user === 'string' && doc.user.length === 24) {
        doc.user = new mongoose.Types.ObjectId(doc.user);
      }
      if (doc.therapist && typeof doc.therapist === 'string' && doc.therapist.length === 24) {
        doc.therapist = new mongoose.Types.ObjectId(doc.therapist);
      }
      return doc;
    });

    await collection.insertMany(processedData);
    console.log(`Imported ${data.length} documents into ${collectionName}`);
  }

  console.log('Import complete.');
  process.exit(0);
}

importData().catch(err => {
  console.error(err);
  process.exit(1);
});
