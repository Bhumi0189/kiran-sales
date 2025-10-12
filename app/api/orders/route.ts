import { NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
// Simple admin check using a header (replace with JWT/session/cookie in production)
function isAdmin(req: Request) {
  const auth = req.headers.get("authorization")
  // Example: pass 'Bearer admin-token' for admin requests
  return auth === "Bearer admin-token"
}

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

// Ensure the customer object includes a name property during order creation
export async function POST(req: Request) {
  try {
    try {
      const headerObj = Object.fromEntries(req.headers);
      console.log('[app-route][orders][POST] incoming request url:', req.url);
      console.log('[app-route][orders][POST] headers:', headerObj);
    } catch (e) {
      console.log('[app-route][orders][POST] headers: <unserializable>')
    }
    const { db } = await connectToDatabase();

    // Check if the orders collection exists
    const collections = await db.listCollections().toArray();
    const ordersCollectionExists = collections.some((col: { name: string }) => col.name === "orders");

    if (!ordersCollectionExists) {
      console.error("Orders collection does not exist in the database.");
      return NextResponse.json({ error: "Orders collection is missing in the database." }, { status: 500 });
    }

  const body = await req.json();
  console.log('[app-route][orders][POST] Received request body:', JSON.stringify(body));

    // Legacy support: if payload looks like a lookup ({ email, userId }) then return matching orders
    const looksLikeQuery = body && (body.email || body.userId) && !body.items && !body.customer && !body.totalAmount
    if (looksLikeQuery) {
      const query: any = {}
      if (body.email) query['customer.email'] = body.email
      if (body.userId) query['userId'] = body.userId
      const orders = await db.collection('orders').find(query).sort({ orderDate: -1 }).toArray()
      return NextResponse.json({ orders }, { status: 200 })
    }

    // Validate request body for order creation
    if (!body.customer || !body.customer.email || !body.customer.firstName || !body.customer.lastName ||
        !body.items || body.items.length === 0 || !body.totalAmount || !body.paymentMethod || !body.shippingAddress) {
      console.error("Validation failed: Missing required fields", body);
      return NextResponse.json({ error: "Missing required fields in the order." }, { status: 400 });
    }

    // Generate unique orderId
    const orderId = `ORD-${Date.now()}`;
    const orderData = {
      ...body,
      orderId,
      orderDate: new Date().toISOString(),
      status: "Pending",
      deliveryStatus: "Pending",
    };

    console.log("Prepared order data for insertion:", orderData);

    // Insert the order into the database
    const result = await db.collection("orders").insertOne(orderData);

    if (!result.acknowledged) {
      console.error("Failed to insert order into the database.", result);
      return NextResponse.json({ error: "Failed to save order in the database." }, { status: 500 });
    }

    console.log("Order inserted successfully", result);

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.insertedId,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error inserting order", error);
    return NextResponse.json({ error: "Failed to place order. Please try again later." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()
    const { _id, ...update } = body
    const result = await db.collection("orders").updateOne({ _id: new ObjectId(_id) }, { $set: update })
    return NextResponse.json({ modifiedCount: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { db } = await connectToDatabase()
    const { _id } = await req.json()
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update the GET method to ensure customer name is included in the response
export async function GET(req: Request) {
  try {
    const { db } = await connectToDatabase();
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "0", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = limit > 0 ? (page - 1) * limit : 0;

    let query: any = {};

    if (email) {
      query.$or = [
        { "customer.email": email },
        { customerEmail: email }
      ];
    } else if (userId) {
      query.$or = [
        { userId },
        { "customer.id": userId }
      ];
    } else {
      // If no email/userId is provided, allow admin requests or local/dev env to fetch all orders.
      // Production non-admin requests should still be rejected.
      if (isAdmin(req) || process.env.NODE_ENV !== "production") {
        query = {}
      } else {
        return NextResponse.json({ error: "Unauthorized or missing email/userId" }, { status: 401 });
      }
    }

    if (status) {
      query.$or = query.$or.map((q: any) => ({
        $and: [q, { $or: [{ status }, { deliveryStatus: status }] }]
      }));
    }

    const cursor = db.collection("orders").find(query).sort({ orderDate: -1, createdAt: -1 });
    if (limit > 0) cursor.skip(skip).limit(limit);

    const orders = await cursor.toArray();
    const total = await db.collection("orders").countDocuments(query);
    const hasMore = limit > 0 ? page * limit < total : false;

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        ...order,
        customerName: order.customer?.name || "N/A",
        orderDate: order.orderDate || order.createdAt
      })),
      hasMore
    });
  } catch (error: any) {
    console.error("Error fetching orders", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
