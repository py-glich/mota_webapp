import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mb278427_db_user:20062005@cluster0.ldrdbe5.mongodb.net/motopro_pos?retryWrites=true&w=majority';

// Global cache pattern for Vercel Serverless
let cachedPromise: Promise<MongoClient> | null = (global as any)._mongoClientPromise || null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!cachedPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsInsecure: true,
    });
    cachedPromise = client.connect();
    (global as any)._mongoClientPromise = cachedPromise;
  }
  return cachedPromise;
}

export default async function handler(req: any, res: any) {
  // Set CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api\/?/, '');
  const segments = pathname.split('/').filter(Boolean);

  try {
    const client = await getMongoClient();
    const db = client.db('motopro_pos');

    // GET /api/bootstrap -> Full state for initial load & refresh
    if (segments[0] === 'bootstrap') {
      const products = await db.collection('products').find({}).toArray();
      const categories = await db.collection('categories').find({}).toArray();
      const customers = await db.collection('customers').find({}).toArray();
      const suppliers = await db.collection('suppliers').find({}).toArray();
      const invoices = await db.collection('invoices').find({}).toArray();
      const purchases = await db.collection('purchases').find({}).toArray();
      const expenses = await db.collection('expenses').find({}).toArray();
      const users = await db.collection('users').find({}).toArray();

      return res.status(200).json({
        products,
        categories,
        customers,
        suppliers,
        invoices,
        purchases,
        expenses,
        users,
        _meta: {
          mongoStatus: {
            connected: true,
            provider: 'MongoDB Atlas Cloud',
            uri: 'mongodb+srv://cluster0.ldrdbe5.mongodb.net'
          }
        }
      });
    }

    // PRODUCTS ENDPOINTS: /api/products
    if (segments[0] === 'products') {
      const id = segments[1];

      // GET /api/products
      if (req.method === 'GET' && !id) {
        const products = await db.collection('products').find({}).toArray();
        return res.status(200).json(products);
      }

      // POST /api/products -> Add new product
      if (req.method === 'POST') {
        const newProduct = req.body;
        if (!newProduct.id) {
          newProduct.id = `PRD-${Date.now().toString().slice(-4)}`;
        }
        await db.collection('products').insertOne(newProduct);
        return res.status(201).json({ success: true, product: newProduct });
      }

      // PUT /api/products/:id -> Update product (including image, price, stock)
      if (req.method === 'PUT' && id) {
        const updateData = req.body;
        delete updateData._id; // MongoDB immutable ID guard
        await db.collection('products').updateOne(
          { id },
          { $set: updateData },
          { upsert: true }
        );
        return res.status(200).json({ success: true, product: updateData });
      }

      // DELETE /api/products/:id
      if (req.method === 'DELETE' && id) {
        await db.collection('products').deleteOne({ id });
        return res.status(200).json({ success: true, message: 'Deleted' });
      }
    }

    // CATEGORIES ENDPOINTS: /api/categories
    if (segments[0] === 'categories') {
      const id = segments[1];

      if (req.method === 'GET') {
        const categories = await db.collection('categories').find({}).toArray();
        return res.status(200).json(categories);
      }

      if (req.method === 'POST') {
        const newCat = req.body;
        await db.collection('categories').insertOne(newCat);
        return res.status(201).json({ success: true, category: newCat });
      }

      if (req.method === 'DELETE' && id) {
        await db.collection('categories').deleteOne({ id });
        return res.status(200).json({ success: true });
      }
    }

    // AUTH / PROFILE ENDPOINT: /api/auth/profile
    if (segments[0] === 'auth' && segments[1] === 'profile') {
      if (req.method === 'PUT') {
        const { userId, name, email, phone, avatar, newPassword } = req.body;
        const updateFields: any = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;
        if (avatar) updateFields.avatar = avatar;
        if (newPassword) updateFields.password = newPassword;

        await db.collection('users').updateOne(
          { id: userId },
          { $set: updateFields }
        );

        const updatedUser = await db.collection('users').findOne({ id: userId });
        return res.status(200).json({ success: true, user: updatedUser });
      }
    }

    // Fallback: 404
    return res.status(404).json({ error: 'Endpoint not found', path: pathname });

  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
