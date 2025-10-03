import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB || "kiransales";
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// GET: Return admin settings
export async function GET() {
  const { db } = await connectToDatabase();
  const settings = await db.collection("settings").findOne({ _id: "admin" });
  return NextResponse.json(settings || {});
}

// POST: Update admin settings
export async function POST(req: Request) {
  const { db } = await connectToDatabase();
  const body = await req.json();
  await db.collection("settings").updateOne(
    { _id: "admin" },
    { $set: body },
    { upsert: true }
  );
  return NextResponse.json({ success: true });
}
