import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for export');

  const collections = await mongoose.connection.db.collections();
  const exportDir = path.join(__dirname, 'seedData');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  for (let collection of collections) {
    const data = await collection.find({}).toArray();
    const filePath = path.join(exportDir, `${collection.collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Exported ${data.length} documents from ${collection.collectionName}`);
  }

  console.log('Export complete. Data saved in backend/seedData/');
  process.exit(0);
}

exportData().catch(err => {
  console.error(err);
  process.exit(1);
});
