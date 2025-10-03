// FILE: app/api/admin/debug-orders/route.ts
// Create this file to debug your order structure
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

    // Get sample order to see structure
    const sampleOrder = await db.collection("orders").findOne({})
    
    // Get all orders with their total fields
    const allOrders = await db.collection("orders")
      .find({})
      .project({ 
        _id: 1, 
        total: 1, 
        totalAmount: 1, 
        amount: 1,
        price: 1,
        orderTotal: 1,
      })
      .toArray()

    return NextResponse.json({
      message: "Debug info for orders",
      sampleOrder,
      allOrders,
      orderCount: allOrders.length,
    })
  } catch (error: any) {
    console.error("Debug API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch debug data" }, 
      { status: 500 }
    )
  }
}