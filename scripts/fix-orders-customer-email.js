// Script to fix orders in MongoDB by ensuring each order has a customer.email field
// Usage: node scripts/fix-orders-customer-email.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'kiransales';

async function main() {
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const orders = db.collection('orders');

  // Find orders where customer.email is missing but user email is present elsewhere
  const cursor = orders.find({
    $or: [
      { 'customer.email': { $exists: false } },
      { 'customer.email': null },
      { 'customer.email': '' }
    ]
  });

  let updated = 0;
  while (await cursor.hasNext()) {
    const order = await cursor.next();
    // Try to infer email from other fields
    let email = null;
    if (order.customer && order.customer.email) {
      email = order.customer.email;
    } else if (order.email) {
      email = order.email;
    } else if (order.userEmail) {
      email = order.userEmail;
    }
    if (email) {
      await orders.updateOne(
        { _id: order._id },
        { $set: { 'customer.email': email } }
      );
      updated++;
      console.log(`Updated order ${order._id} with email ${email}`);
    } else {
      console.warn(`Order ${order._id} missing email, skipped.`);
    }
  }
  await client.close();
  console.log(`Done. Updated ${updated} orders.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
