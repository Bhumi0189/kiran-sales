import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB || "kiransales"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  const client = await MongoClient.connect(uri)
  const db = client.db(dbName)
  cachedClient = client
  cachedDb = db
  return { client, db }
}

function isAdmin(req: Request) {
  const auth = req.headers.get("authorization")
  return auth === "Bearer admin-token"
}

// GET /api/admin/users/stats
export async function GET(req: Request) {
  try {
    if (!isAdmin(req) && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Aggregation pipeline:
    // Try to group by customer.id or userId if present, else fallback to customer.email
    const pipeline = [
      {
        $project: {
          userId: { $ifNull: ["$userId", "$customer.id"] },
          email: { $ifNull: ["$customer.email", "$customerEmail"] },
          amount: { $ifNull: ["$totalAmount", "$total", "$amount", 0] },
        },
      },
      {
        $group: {
          _id: { userId: "$userId", email: "$email" },
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          email: "$_id.email",
          ordersCount: 1,
          totalSpent: 1,
        },
      },
    ]

    const agg = await db.collection("orders").aggregate(pipeline).toArray()

    // Convert ObjectId to string where needed
    const formatted = agg.map((r: any) => ({
      userId: r.userId ? String(r.userId) : null,
      email: r.email || null,
      ordersCount: r.ordersCount || 0,
      totalSpent: r.totalSpent || 0,
    }))

    return NextResponse.json({ stats: formatted })
  } catch (error: any) {
    console.error("Admin users stats error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
