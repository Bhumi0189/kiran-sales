// Script to import all products from products-bulk.json into the MongoDB products collection

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'kiransales';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '../products-bulk.json'), 'utf8'));

  // Remove all existing products first (optional, for a clean import)
  await db.collection('products').deleteMany({});

  // Insert all products
  const result = await db.collection('products').insertMany(products);
  console.log(`Inserted ${result.insertedCount} products.`);
  await client.close();
}

main().catch(console.error);
