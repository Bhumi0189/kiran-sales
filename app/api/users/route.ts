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

export async function PUT(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { _id, ...update } = body
    const result = await db.collection("users").updateOne({ _id: new ObjectId(_id) }, { $set: update })
    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const { _id } = await req.json()
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const users = await db.collection("users").find({}).toArray()
    const orders = await db.collection("orders").find({}).toArray()

    // Add totalOrders, totalSpent, and ensure productId for each customer
    const usersWithStats = users.map((user: any) => {
      if (user.role === "customer") {
        const userOrders = orders.filter((o: any) => o.customer?.email === user.email)
        const totalOrders = userOrders.length
        const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        // Ensure productId exists for all items in the orders
        const enrichedOrders = userOrders.map((order: any) => {
          order.items = order.items?.map((item: any) => ({
            ...item,
            productId: item.productId || "unknown-product-id",
          }))
          return order
        })

        return { ...user, totalOrders, totalSpent, orders: enrichedOrders }
      }
      return { ...user, totalOrders: 0, totalSpent: 0 }
    })

    return NextResponse.json(usersWithStats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
