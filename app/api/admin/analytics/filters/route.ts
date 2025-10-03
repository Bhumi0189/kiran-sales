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

function isAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin-token";
}

// GET /api/admin/analytics/filters
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { db } = await connectToDatabase();
  // Get unique payment methods and product categories
  const paymentMethods = await db.collection("orders").distinct("paymentMethod");
  const categories = await db.collection("products").distinct("category");
  return NextResponse.json({ paymentMethods, categories });
}
