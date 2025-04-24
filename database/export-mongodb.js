/**
 * MongoDB Export Script
 * 
 * This script exports data from MongoDB to JSON files.
 * Run this script with Node.js to create data dumps.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const uri = 'mongodb://localhost:27017';
const dbName = 'online-story-app';

// Output directory
const outputDir = path.join(__dirname, 'mongodb', 'dump');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function exportCollection(db, collectionName) {
  try {
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    
    const outputPath = path.join(outputDir, `${collectionName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Exported ${data.length} documents from ${collectionName} to ${outputPath}`);
  } catch (err) {
    console.error(`Error exporting collection ${collectionName}:`, err);
  }
}

async function main() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
    
    // Export each collection
    for (const collectionName of collectionNames) {
      await exportCollection(db, collectionName);
    }
    
    console.log('Export completed successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
