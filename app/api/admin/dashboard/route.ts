// FILE: app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB || "kiransales"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }
  const client = await MongoClient.connect(uri)
  const db = client.db(dbName)
  cachedClient = client
  cachedDb = db
  return { client, db }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get counts and revenue in parallel
    const [usersCount, ordersCount, productsCount, revenueAgg, recentOrders] = await Promise.all([
      db.collection("users").countDocuments({}),
      db.collection("orders").countDocuments({}),
      db.collection("products").countDocuments({}),
      // Aggregate total revenue - use totalAmount field
      db.collection("orders").aggregate([
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: "$totalAmount" }
          } 
        }
      ]).toArray(),
      // Get 5 most recent orders
      db.collection("orders")
        .find({}, { 
          projection: { 
            _id: 1, 
            "customer.name": 1, 
            totalAmount: 1,
            orderDate: 1, 
            createdAt: 1, 
            status: 1 
          } 
        })
        .sort({ orderDate: -1, createdAt: -1 })
        .limit(5)
        .toArray(),
    ])

    // Calculate revenue from aggregation result
    const revenue = Array.isArray(revenueAgg) && revenueAgg.length > 0 
      ? revenueAgg[0].totalRevenue 
      : 0

    // Format recent orders - use totalAmount field
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order._id?.toString() || order.id,
      customer: order.customer?.name || "Guest",
      amount: order.totalAmount || 0,
      date: order.orderDate || order.createdAt || "",
      status: order.status || "pending",
    }))

    // Log for debugging
    console.log("Revenue calculation:", { 
      ordersCount, 
      revenue,
      sampleOrder: recentOrders[0] 
    })

    return NextResponse.json({
      usersCount,
      ordersCount,
      productsCount,
      revenue, // Real-time revenue from all orders
      recentOrders: formattedRecentOrders,
    })
  } catch (error: any) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" }, 
      { status: 500 }
    )
  }
}