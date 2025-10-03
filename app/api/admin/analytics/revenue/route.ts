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

// GET /api/admin/analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&group=day|week|month
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { db } = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const group = searchParams.get("group") || "day";

  const match: any = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  // Group by day/week/month
  let dateFormat = "%Y-%m-%d";
  if (group === "week") dateFormat = "%Y-%U";
  if (group === "month") dateFormat = "%Y-%m";

  const pipeline = [
    { $match: match },
    { $addFields: { createdAt: { $toDate: "$createdAt" } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        totalRevenue: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const data = await db.collection("orders").aggregate(pipeline).toArray();
  return NextResponse.json(data);
}
