import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getMongoClient } from "@/lib/mongo"

const dbName = process.env.MONGODB_DB || "kiransales"

export async function POST(req: Request) {
  try {
    const client = await getMongoClient()
    const db = client.db(dbName)
    const body = await req.json()
    const result = await db.collection("products").insertOne(body)
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const client = await getMongoClient()
    const db = client.db(dbName)
    const body = await req.json()
    const { _id, ...update } = body
    const result = await db.collection("products").updateOne({ _id: new ObjectId(_id) }, { $set: update })
    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    console.error("PUT /api/products error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await getMongoClient()
    const db = client.db(dbName)
    const { _id } = await req.json()
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error: any) {
    console.error("DELETE /api/products error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await getMongoClient()
    const db = client.db(dbName)
    const products = await db.collection("products").find({}).toArray()
    // Always return an array, never an object
    return NextResponse.json(Array.isArray(products) ? products : [])
  } catch (error: any) {
    console.error("GET /api/products error:", error)
    return NextResponse.json([], { status: 500 }) // Always return array
  }
}
