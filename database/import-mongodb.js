/**
 * MongoDB Import Script
 * 
 * This script imports data from JSON files into MongoDB.
 * Run this script with Node.js to restore data dumps.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const uri = 'mongodb://localhost:27017';
const dbName = 'online-story-app';

// Input directory
const inputDir = path.join(__dirname, 'mongodb', 'dump');

async function importCollection(db, filePath) {
  try {
    const fileName = path.basename(filePath);
    const collectionName = fileName.replace('.json', '');
    
    const collection = db.collection(collectionName);
    
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.length > 0) {
      // Drop existing collection
      await collection.drop().catch(() => console.log(`Collection ${collectionName} does not exist, creating new`));
      
      // Insert the data
      const result = await collection.insertMany(data);
      console.log(`Imported ${result.insertedCount} documents into ${collectionName}`);
    } else {
      console.log(`No documents to import for ${collectionName}`);
    }
  } catch (err) {
    console.error(`Error importing file ${filePath}:`, err);
  }
}

async function main() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Get all JSON files in the input directory
    const files = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(inputDir, file));
    
    console.log(`Found ${files.length} JSON files to import`);
    
    // Import each file
    for (const file of files) {
      await importCollection(db, file);
    }
    
    console.log('Import completed successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
