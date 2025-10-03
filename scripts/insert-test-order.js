// Script to insert a test order for customer@example.com into the MongoDB orders collection

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'kiransales';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Get email and name from command line args
  const email = process.argv[2] || 'customer@example.com';
  const firstName = process.argv[3] || 'John';
  const lastName = process.argv[4] || 'Doe';

  const testOrder = {
    customer: {
      email,
      firstName,
      lastName,
    },
    orderDate: new Date(),
    total: 1999,
    status: 'paid',
    items: [
      {
        productId: '1',
        productName: 'Surgeons Dress (Lycra Fabric)',
        quantity: 1,
        price: 1200,
      },
      {
        productId: '2',
        productName: 'Surgeons Dress (Poly Cotton)',
        quantity: 1,
        price: 799,
      },
    ],
    createdAt: new Date(),
  };

  const result = await db.collection('orders').insertOne(testOrder);
  console.log('Inserted test order with _id:', result.insertedId);
  await client.close();
}

main().catch(console.error);
