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

// GET /api/admin/analytics/breakdown
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { db } = await connectToDatabase();
  const orders = await db.collection("orders").find({}).toArray();

  // Average order value
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  // Top 5 selling products
  const productCounts: Record<string, { name: string; count: number }> = {};
  for (const order of orders) {
    for (const item of order.items || []) {
      if (!productCounts[item.productId]) {
        productCounts[item.productId] = { name: item.name, count: 0 };
      }
      productCounts[item.productId].count += item.quantity || 1;
    }
  }
  const topProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Payment method breakdown
  const paymentCounts: Record<string, number> = {};
  for (const order of orders) {
    const method = order.paymentMethod || "Other";
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  }

  return NextResponse.json({
    totalRevenue,
    avgOrderValue,
    topProducts,
    paymentCounts,
  });
}
