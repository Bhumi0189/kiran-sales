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

// POST: Add or update a review for a product by a user
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, userId, orderId, rating, review, imageUrl, userName } = body
    if (!productId || !userId || !orderId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const { db } = await connectToDatabase()

    // Enhanced logging for POST endpoint
    console.log("[POST] Incoming review data:", { productId, userId, orderId, rating, review, imageUrl, userName })

    const result = await db.collection("reviews").updateOne(
      { productId, userId, orderId },
      {
        $set: {
          productId,
          userId,
          orderId,
          rating,
          review: review || "",
          imageUrl: imageUrl || "",
          userName: userName || "",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    )

    console.log("[POST] Database operation result:", result)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET: Get reviews for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId")
    const orderId = searchParams.get("orderId")
    const query: any = {}
    if (productId) query.productId = productId
    if (userId) query.userId = userId
    // Ensure the query includes orderId if provided
    if (orderId) query.orderId = orderId

    if (!productId && !userId && !orderId) {
      return NextResponse.json({ error: "Missing productId, userId, or orderId" }, { status: 400 })
    }
    const { db } = await connectToDatabase()

    // Enhanced logging for GET endpoint
    console.log("[GET] Query parameters:", { productId, userId, orderId })

    // Fetch reviews from the database
    const reviews = await db.collection("reviews").find(query).sort({ createdAt: -1 }).toArray()

    // Log the fetched reviews for debugging
    console.log("[GET] Fetched reviews for orderId:", orderId, reviews)

    return NextResponse.json(reviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
