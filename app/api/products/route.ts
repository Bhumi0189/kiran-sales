import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getMongoClient } from "@/lib/mongo"
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

const dbName = process.env.MONGODB_DB || "kiransales"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    try { console.log('[app-route][products][POST] incoming body:', JSON.stringify(body)) } catch (e) { console.log('[app-route][products][POST] incoming body: <unserializable>') }

    // Validate sizes and colors
    if (!Array.isArray(body.sizes) || !Array.isArray(body.colors)) {
      return NextResponse.json({ error: "Invalid sizes or colors format" }, { status: 400 })
    }

    // Try to use MongoDB first. If Mongo is unavailable (e.g. no MONGODB_URI in dev), fall back to a local file
    try {
      const client = await getMongoClient()
      const db = client.db(dbName)
      const result = await db.collection("products").insertOne(body)
      return NextResponse.json({ insertedId: result.insertedId }, { status: 201 })
    } catch (dbErr) {
      console.error('MongoDB unavailable or insert failed, falling back to file storage:', dbErr)
      try {
        const dataDir = path.join(process.cwd(), 'data')
        await mkdir(dataDir, { recursive: true })
        const filePath = path.join(dataDir, 'products.json')
        let arr: any[] = []
        try {
          const existing = await readFile(filePath, 'utf8')
          arr = JSON.parse(existing)
          if (!Array.isArray(arr)) arr = []
        } catch (e) {
          arr = []
        }
        const insertedId = Date.now().toString()
        arr.push({ _id: insertedId, ...body })
        await writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8')
        return NextResponse.json({ insertedId }, { status: 201 })
      } catch (fileErr) {
        console.error('Fallback file write failed:', fileErr)
        return NextResponse.json({ error: fileErr?.message || 'Failed to save product' }, { status: 500 })
      }
    }
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

    // Validate sizes and colors if present
    if (update.sizes && !Array.isArray(update.sizes)) {
      return NextResponse.json({ error: "Invalid sizes format" }, { status: 400 })
    }
    if (update.colors && !Array.isArray(update.colors)) {
      return NextResponse.json({ error: "Invalid colors format" }, { status: 400 })
    }

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
