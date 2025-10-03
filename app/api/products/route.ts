import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

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

export async function POST(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const result = await db.collection("products").insertOne(body)
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { _id, ...update } = body
    const result = await db.collection("products").updateOne({ _id: new ObjectId(_id) }, { $set: update })
    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const { _id } = await req.json()
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const products = await db.collection("products").find({}).toArray()
    // Always return an array, never an object
    return NextResponse.json(Array.isArray(products) ? products : [])
  } catch (error: any) {
    console.error("/api/products error:", error)
    return NextResponse.json([], { status: 500 }) // Always return array
  }
}
