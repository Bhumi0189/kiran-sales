// This script will update all products in the database to add an image if missing, using a default placeholder or a mapped image from products-bulk.json

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'kiransales';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const products = await db.collection('products').find({}).toArray();
  const bulk = JSON.parse(fs.readFileSync(path.join(__dirname, '../products-bulk.json'), 'utf8'));

  // Map product name to image from bulk
  const nameToImage = Object.fromEntries(bulk.map(p => [p.name, p.image]));

  // Print all product names from DB and bulk for comparison
  console.log('--- Product names in DB ---');
  products.forEach(p => console.log(p.name));
  console.log('--- Product names in products-bulk.json ---');
  bulk.forEach(p => console.log(p.name));

  let updated = 0;
  for (const product of products) {
    const image = nameToImage[product.name] || '/placeholder.svg';
    await db.collection('products').updateOne({ _id: product._id }, { $set: { image } });
    updated++;
  }
  console.log(`Force-updated ${updated} products with images.`);
  await client.close();
}

main().catch(console.error);
