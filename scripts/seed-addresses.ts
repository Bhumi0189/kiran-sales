import { MongoClient } from 'mongodb'

async function seedAddresses() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kiran-sales'
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()
    const addresses = db.collection('addresses')

    // Insert a sample address document
    const result = await addresses.insertOne({
      userId: 'sample-user-id',
      name: 'John Doe',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Sample City',
      pincode: '123456',
      primary: true,
      createdAt: new Date(),
    })

    console.log('Inserted sample address with id:', result.insertedId)
  } catch (err) {
    console.error('Error seeding addresses:', err)
  } finally {
    await client.close()
  }
}

seedAddresses()
