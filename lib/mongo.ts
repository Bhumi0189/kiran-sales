import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set. Please set it in your environment or Vercel project settings.");
}
let client: MongoClient | null = null;

export async function getMongoClient() {
  if (!client) {
  client = new MongoClient(uri as string);
    await client.connect();
  }
  return client;
}
