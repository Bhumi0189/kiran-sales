import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongo';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: true, // Ensure body parsing is enabled
  },
};

const authenticate = (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded; // Attach user info to the request object
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return false;
  }
};

// Helper: try to decode a bearer token if present, but don't send 401 on failure.
const tryDecodeToken = (req: NextApiRequest): any | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (e) {
    console.warn('Failed to decode token for optional use:', e);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    try {
      console.log('[pages-api][orders] incoming method:', method, 'url:', req.url)
      console.log('[pages-api][orders] headers:', { authorization: req.headers.authorization })
    } catch (e) {
      console.log('[pages-api][orders] headers: <unserializable>')
    }
    const { db } = await connectToDatabase();
    if (method === 'POST') {
      // Distinguish between two POST usages:
      // 1) Creating a new order (full order object with customerName/customerEmail/items/totalAmount)
      // 2) Legacy callers querying orders by email/userId via POST with body { email, userId }
  const payload = req.body;
  console.log('[pages-api][orders][POST] payload:', JSON.stringify(payload));

      const looksLikeQuery = payload && (payload.email || payload.userId) && !payload.items && !payload.customerName && !payload.customerEmail;

      if (looksLikeQuery) {
        // Legacy fetch-by-email POST: return orders for the email or userId (no auth required for legacy callers)
        const email = payload.email;
        const userId = payload.userId;
        const query: any = {};
        if (email) query.customerEmail = email;
        if (userId) query.userId = userId;
        const orders = await db.collection('orders').find(query).sort({ orderDate: -1 }).toArray();
        return res.status(200).json({ orders });
      }

      // Otherwise treat as creating a new order -> require authentication for creation
      if (!authenticate(req, res)) return;

      const order = payload;
      if (!order || !order.customerName || !order.customerEmail || !order.items || !order.totalAmount) {
        return res.status(400).json({ error: 'Invalid order data: Missing required fields' });
      }

      console.log('Incoming order data for creation:', order); // Debugging log

      if (!order.customerName) {
        if (order.firstName && order.lastName) {
          order.customerName = `${order.firstName} ${order.lastName}`;
          console.log('Constructed customerName:', order.customerName); // Log constructed customerName
        } else {
          console.error('Validation failed: Missing customer name and insufficient data to construct it');
          return res.status(400).json({ error: 'Invalid order data: Missing customer name' });
        }
      }

      const result = await db.collection('orders').insertOne(order);
      return res.status(201).json({ message: 'Order saved successfully', orderId: result.insertedId });
    } else if (method === 'GET') {
      // Fetch orders for a specific user
      let { email } = req.query as any;


      // If no email in query, try to use authenticated user's email from Authorization token (optional)
      if (!email) {
        const decoded = tryDecodeToken(req);
        if (decoded && decoded.email) {
          email = decoded.email;
        }
      }

      if (!email) {
        return res.status(400).json({ error: 'Email is required to fetch orders' });
      }

      console.log('Incoming request body:', req.body); // Debugging log to inspect request payload
      console.log('Incoming query parameters or fallback email:', email); // Debugging log to inspect query parameters

      const orders = await db.collection('orders').find({ customerEmail: email }).toArray();
      return res.status(200).json({ orders });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling orders API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}