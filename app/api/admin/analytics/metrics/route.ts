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

// Simple admin check using a header (reuse from orders route)
function isAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin-token";
}

// GET /api/admin/analytics/metrics
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { db } = await connectToDatabase();
  const orders = await db.collection("orders").find({}).toArray();
  const customers = await db.collection("users").find({ role: "customer" }).toArray();

  // Calculate metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const totalCustomers = customers.length;
  const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    totalCustomers,
    statusCounts,
  });
}
