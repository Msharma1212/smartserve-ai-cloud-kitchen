import "dotenv/config";
import { MongoClient, Db } from "mongodb";
import pg from "pg";
import fs from "fs";
import path from "path";

const { Pool } = pg;

// Define directory for local JSON database backups (used when DB credentials are not yet supplied)
const LOCAL_DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(LOCAL_DB_DIR)) {
  fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
}

const MONGO_FALLBACK_FILE = path.join(LOCAL_DB_DIR, "mongo_menu.json");
const POSTGRES_FALLBACK_FILE = path.join(LOCAL_DB_DIR, "postgres_tables.json");

// ==========================================
// DB DRIVER INSTANCE MANAGEMENT (LAZY INITIALIZED)
// ==========================================
let mongoClientInstance: MongoClient | null = null;
let mongoDbInstance: Db | null = null;
let pgPoolInstance: pg.Pool | null = null;

export function isMongoConnected(): boolean {
  return typeof process.env.MONGODB_URI === "string" && process.env.MONGODB_URI.length > 0 && mongoDbInstance !== null;
}

export function isPostgresConnected(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0 && pgPoolInstance !== null;
}

// Lazy-Initialized MongoDB Client
export async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null; // Fallback to local files
  }

  if (!mongoDbInstance) {
    try {
      console.log("Connecting to real MongoDB instance...");
      mongoClientInstance = new MongoClient(uri);
      await mongoClientInstance.connect();
      mongoDbInstance = mongoClientInstance.db();
      console.log("Real MongoDB connection established successfully! ✓");
    } catch (err) {
      console.error("Real MongoDB connection failed, falling back to JSON storage:", err);
      mongoDbInstance = null;
    }
  }
  return mongoDbInstance;
}

// Lazy-Initialized PostgreSQL Pool
export async function getPgPool(): Promise<pg.Pool | null> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null; // Fallback to local files
  }

  if (!pgPoolInstance) {
    try {
      console.log("Connecting to real PostgreSQL database pool...");
      pgPoolInstance = new Pool({
        connectionString: url,
        ssl: {
          rejectUnauthorized: false // Required for platforms like CockroachDB / Render / Heroku Postgres
        }
      });
      
      // Try a test query
      await pgPoolInstance.query("SELECT NOW()");
      console.log("Real PostgreSQL connection validated successfully! ✓");
      
      // Bootstrap PostgreSQL database schemas automatically
      await bootstrapPostgresSchema(pgPoolInstance);
    } catch (err) {
      console.error("Real PostgreSQL connection failed, falling back to JSON storage:", err);
      pgPoolInstance = null;
    }
  }
  return pgPoolInstance;
}

// ==========================================
// POSTGRESQL SCHEMAS AUTO-BOOTSTRAPPER
// ==========================================
async function bootstrapPostgresSchema(pool: pg.Pool) {
  try {
    console.log("Bootstrapping real PostgreSQL database tables...");
    
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        phone VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        wallet_balance INT NOT NULL DEFAULT 1800,
        role VARCHAR(50) NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Franchises Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS franchises (
        code VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        admin_email VARCHAR(150) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sales INT NOT NULL DEFAULT 0
      );
    `);

    // 3. Shift Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shift_logs (
        id SERIAL PRIMARY KEY,
        emp_id VARCHAR(50) NOT NULL,
        emp_name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        hours INT NOT NULL,
        checked_in BOOLEAN NOT NULL,
        logged BOOLEAN NOT NULL,
        UNIQUE(emp_id, date)
      );
    `);

    // 4. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
        pnr VARCHAR(50),
        train_number VARCHAR(50),
        train_name VARCHAR(100),
        delivery_station VARCHAR(100),
        seat_info VARCHAR(50),
        delivery_address TEXT,
        branch_code VARCHAR(50) REFERENCES franchises(code),
        branch_name VARCHAR(150) NOT NULL,
        items TEXT NOT NULL, -- JSON string
        tax INT NOT NULL,
        delivery_charge INT NOT NULL,
        discount INT NOT NULL,
        total INT NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_status VARCHAR(20) NOT NULL,
        stage INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        rider_id VARCHAR(50),
        rider_name VARCHAR(100),
        rider_lat DOUBLE PRECISION NOT NULL,
        rider_lon DOUBLE PRECISION NOT NULL,
        target_lat DOUBLE PRECISION NOT NULL,
        target_lon DOUBLE PRECISION NOT NULL,
        time_left_seconds INT
      );
    `);

    // 5. Carts Table (User Persistent Cart)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        phone VARCHAR(20) PRIMARY KEY REFERENCES users(phone) ON DELETE CASCADE,
        cart_items TEXT NOT NULL, -- JSON String
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed preset franchises with ON CONFLICT DO NOTHING to always ensure new train stations are registered
    const seeds = [
      ["DEL-CP", "SmartServe HQ (Connaught Place)", "Regal Building, Connaught Circus, New Delhi - 110001", 28.6299, 77.2183, "cp.admin@smartserve.ai", true, 125400],
      ["ND-SEC62", "SmartServe Noida (Sector 62)", "Stellar IT Park, Sector 62, Noida, UP - 201301", 28.6273, 77.3725, "noida62@smartserve.ai", true, 84300],
      ["GGN-CYB", "SmartServe Gurgaon (Cyber City)", "DLF CyberHub, Phase 3, Gurgaon, HR - 122002", 28.4950, 77.0878, "gurgaon@smartserve.ai", true, 98150],
      ["CNB", "SmartServe Kanpur Central Hub", "Platform 1, Kanpur Central Railway Station, Kanpur - 208004", 26.4534, 80.3542, "kanpur.trains@smartserve.ai", true, 145000],
      ["KNP-JN", "SmartServe Railway Hub (Kanpur Junction)", "Platform 1, Kanpur Central Railway Station, Kanpur - 208004", 26.4534, 80.3542, "kanpur.trains@smartserve.ai", true, 145000],
      ["NDLS", "SmartServe Delhi Terminal", "Platform 12, New Delhi Railway Station, New Delhi - 110055", 28.6415, 77.2201, "newdelhi.hubs@smartserve.ai", true, 62000],
      ["PRYJ", "SmartServe Prayagraj Hub", "Platform 3, Prayagraj Junction, Prayagraj - 211001", 25.4496, 81.8291, "prayagraj.hub@smartserve.ai", true, 41000],
      ["PNBE", "SmartServe Patna Junction Hub", "Platform 1, Patna Junction, Patna - 800001", 25.6026, 85.1196, "patna.hub@smartserve.ai", true, 35000],
      ["HWH", "SmartServe Howrah Junction Hub", "Platform 8, Howrah Junction, Kolkata - 711101", 22.5849, 88.3414, "howrah.hub@smartserve.ai", true, 78000],
      ["DGR", "SmartServe Durgapur Hub", "Platform 2, Durgapur Railway Station, Durgapur - 713203", 23.4981, 87.3119, "durgapur.hub@smartserve.ai", true, 12000],
      ["SDAH", "SmartServe Sealdah Terminal Hub", "Platform 5, Sealdah Station, Kolkata - 700009", 22.5684, 88.3712, "sealdah.hub@smartserve.ai", true, 23000],
      ["SS-CIVIC", "SmartServe Civic Centre", "Civic Centre, Marhatal, Jabalpur, MP - 482002", 23.1678, 79.9329, "civic.jabalpur@smartserve.ai", true, 58000],
      ["SS-MADAN", "SmartServe Madan Mahal", "Madan Mahal, Jabalpur, MP - 482001", 23.1558, 79.9161, "madan.jabalpur@smartserve.ai", true, 42000],
      ["SS-VIJAY", "SmartServe Vijay Nagar", "Vijay Nagar main road, Jabalpur, MP - 482002", 23.1932, 79.9275, "vijay.jabalpur@smartserve.ai", true, 67000],
      ["SS-NAPIER", "SmartServe Napier Town", "Napier Town, Jabalpur, MP - 482001", 23.1615, 79.9261, "napier.jabalpur@smartserve.ai", true, 52000],
      ["SS-GORAKH", "SmartServe Gorakhpur Hub", "Gorakhpur Road, Jabalpur, MP - 482001", 23.1522, 79.9381, "gorakh.jabalpur@smartserve.ai", true, 89000]
    ];
    for (const s of seeds) {
      await pool.query(
        "INSERT INTO franchises (code, name, address, latitude, longitude, admin_email, is_active, sales) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (code) DO NOTHING",
        s
      );
    }

    console.log("PostgreSQL database tables bootstrapped and validated successfully! ✓");
  } catch (err) {
    console.error("Vulnerability during PostgreSQL schema bootstrapping:", err);
  }
}

// ==========================================
// FALLBACK DATA STORAGE ENGINES (FOR DEVELOPMENT)
// ==========================================

// Pre-seeded local mongo items fallback
const DEFAULT_MENU_ITEMS = [
  {
    id: "p1",
    name: "Classic Overloaded Cheese Pizza",
    category: "Pizza",
    price: 349,
    rating: 4.8,
    isVeg: true,
    isJain: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    description: "Cloud Kitchen signature fresh dough, rich tomato spread, 4-cheese standard blend, and oregano drizzle.",
    tags: ["Best Seller", "Cheesy"]
  },
  {
    id: "p2",
    name: "Spicy Paneer Tikka Supreme Pizza",
    category: "Pizza",
    price: 399,
    rating: 4.9,
    isVeg: true,
    isJain: false,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60",
    description: "Tandoori charred cottage cheese, red bell peppers, sliced jalapenos, and coriander infusion.",
    tags: ["Spicy", "Chef Special"]
  },
  {
    id: "b1",
    name: "AI Crispy Veggie Crunch Burger",
    category: "Burger",
    price: 149,
    rating: 4.7,
    isVeg: true,
    isJain: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60",
    description: "Double layered crunchy vegetable patty, iceberg lettuce, vegan mayonnaise, and soft brioche bun.",
    tags: ["Crunchy", "Value Meal"]
  },
  {
    id: "b2",
    name: "Urban Smoky Barbecue Burger",
    category: "Burger",
    price: 189,
    rating: 4.6,
    isVeg: true,
    isJain: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
    description: "Grilled protein/veggie patty glazed in rich woodsmoke hickory BBQ sauce, melting cheddar, onion rings.",
    tags: ["Smoky", "Intense Flavor"]
  },
  {
    id: "w1",
    name: "Cheesy Paneer Wrap & Jalapeno Relish",
    category: "Wraps",
    price: 179,
    rating: 4.5,
    isVeg: true,
    isJain: true,
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=500&auto=format&fit=crop&q=60",
    description: "Stuffed paneer cubes wrapped in whole-wheat soft tortilla, loaded with dynamic cheese sauce and pickled jalapenos.",
    tags: ["Portable", "Creamy"]
  },
  {
    id: "w2",
    name: "Fiery Crispy Corn Wrap",
    category: "Wraps",
    price: 159,
    rating: 4.4,
    isVeg: true,
    isJain: false,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    description: "Crunchy sweetcorn nuggets tossed with house high-spice schezwan glaze, wrapped crisp with chopped lettuce.",
    tags: ["Spicy", "Fruity Spice"]
  },
  {
    id: "d1",
    name: "Sparkling Mint Mojito",
    category: "Drinks",
    price: 99,
    rating: 4.6,
    isVeg: true,
    isJain: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60",
    description: "Cool refreshing premium club soda infused with lime wedges, raw brown sugar and hand-bruised mint.",
    tags: ["Chilled", "Citrusy"]
  },
  {
    id: "d2",
    name: "Belgian Fudge Chocolate Shake",
    category: "Drinks",
    price: 139,
    rating: 4.9,
    isVeg: true,
    isJain: true,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60",
    description: "Ultra-thick gourmet blend of premium dark Belgian imported chocolate, creamy vanilla base, fudge drizzle.",
    tags: ["Decadent", "Sweet"]
  }
];

export function loadLocalMenu(): any[] {
  if (fs.existsSync(MONGO_FALLBACK_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MONGO_FALLBACK_FILE, "utf-8"));
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  }
  fs.writeFileSync(MONGO_FALLBACK_FILE, JSON.stringify(DEFAULT_MENU_ITEMS, null, 2));
  return DEFAULT_MENU_ITEMS;
}

export function saveLocalMenu(menu: any[]): void {
  fs.writeFileSync(MONGO_FALLBACK_FILE, JSON.stringify(menu, null, 2));
}

// LowDb styled structure for PostgreSQL fallback representation
export interface LocalRelationalData {
  users: Record<string, { phone: string; name: string; wallet_balance: number; role: string; created_at: string }>;
  franchises: Record<string, { code: string; name: string; address: string; latitude: number; longitude: number; admin_email: string; is_active: boolean; sales: number }>;
  orders: Record<string, any>;
  shift_logs: any[];
  carts: Record<string, string>; // phone -> cartString
}

const DEFAULT_FRANCHISES = {
  "DEL-CP": {
    code: "DEL-CP",
    name: "SmartServe HQ (Connaught Place)",
    address: "Regal Building, Connaught Circus, New Delhi - 110001",
    latitude: 28.6299,
    longitude: 77.2183,
    admin_email: "cp.admin@smartserve.ai",
    is_active: true,
    sales: 12540
  },
  "ND-SEC62": {
    code: "ND-SEC62",
    name: "SmartServe Noida (Sector 62)",
    address: "Stellar IT Park, Sector 62, Noida, UP - 201301",
    latitude: 28.6273,
    longitude: 77.3725,
    admin_email: "noida62@smartserve.ai",
    is_active: true,
    sales: 8430
  },
  "GGN-CYB": {
    code: "GGN-CYB",
    name: "SmartServe Gurgaon (Cyber City)",
    address: "DLF CyberHub, Phase 3, Gurgaon, HR - 122002",
    latitude: 28.4950,
    longitude: 77.0878,
    admin_email: "gurgaon@smartserve.ai",
    is_active: true,
    sales: 9815
  },
  "KNP-JN": {
    code: "KNP-JN",
    name: "SmartServe Railway Hub (Kanpur Junction)",
    address: "Platform 1, Kanpur Central Railway Station, Kanpur - 208004",
    latitude: 26.4534,
    longitude: 80.3542,
    admin_email: "kanpur.trains@smartserve.ai",
    is_active: true,
    sales: 14500
  },
  "CNB": {
    code: "CNB",
    name: "SmartServe Kanpur Central Hub",
    address: "Platform 1, Kanpur Central Railway Station, Kanpur - 208004",
    latitude: 26.4534,
    longitude: 80.3542,
    admin_email: "kanpur.trains@smartserve.ai",
    is_active: true,
    sales: 14500
  },
  "NDLS": {
    code: "NDLS",
    name: "SmartServe Delhi Terminal",
    address: "Platform 12, New Delhi Railway Station, New Delhi - 110055",
    latitude: 28.6415,
    longitude: 77.2201,
    admin_email: "newdelhi.hubs@smartserve.ai",
    is_active: true,
    sales: 62000
  },
  "PRYJ": {
    code: "PRYJ",
    name: "SmartServe Prayagraj Hub",
    address: "Platform 3, Prayagraj Junction, Prayagraj - 211001",
    latitude: 25.4496,
    longitude: 81.8291,
    admin_email: "prayagraj.hub@smartserve.ai",
    is_active: true,
    sales: 41000
  },
  "PNBE": {
    code: "PNBE",
    name: "SmartServe Patna Junction Hub",
    address: "Platform 1, Patna Junction, Patna - 800001",
    latitude: 25.6026,
    longitude: 85.1196,
    admin_email: "patna.hub@smartserve.ai",
    is_active: true,
    sales: 35000
  },
  "HWH": {
    code: "HWH",
    name: "SmartServe Howrah Junction Hub",
    address: "Platform 8, Howrah Junction, Kolkata - 711101",
    latitude: 22.5849,
    longitude: 88.3414,
    admin_email: "howrah.hub@smartserve.ai",
    is_active: true,
    sales: 78000
  },
  "DGR": {
    code: "DGR",
    name: "SmartServe Durgapur Hub",
    address: "Platform 2, Durgapur Railway Station, Durgapur - 713203",
    latitude: 23.4981,
    longitude: 87.3119,
    admin_email: "durgapur.hub@smartserve.ai",
    is_active: true,
    sales: 12000
  },
  "SDAH": {
    code: "SDAH",
    name: "SmartServe Sealdah Terminal Hub",
    address: "Platform 5, Sealdah Station, Kolkata - 700009",
    latitude: 22.5684,
    longitude: 88.3712,
    admin_email: "sealdah.hub@smartserve.ai",
    is_active: true,
    sales: 23000
  },
  "SS-CIVIC": {
    code: "SS-CIVIC",
    name: "SmartServe Civic Centre",
    address: "Civic Centre, Marhatal, Jabalpur, MP - 482002",
    latitude: 23.1678,
    longitude: 79.9329,
    admin_email: "civic.jabalpur@smartserve.ai",
    is_active: true,
    sales: 58000
  },
  "SS-MADAN": {
    code: "SS-MADAN",
    name: "SmartServe Madan Mahal",
    address: "Madan Mahal, Jabalpur, MP - 482001",
    latitude: 23.1558,
    longitude: 79.9161,
    admin_email: "madan.jabalpur@smartserve.ai",
    is_active: true,
    sales: 42000
  },
  "SS-VIJAY": {
    code: "SS-VIJAY",
    name: "SmartServe Vijay Nagar",
    address: "Vijay Nagar main road, Jabalpur, MP - 482002",
    latitude: 23.1932,
    longitude: 79.9275,
    admin_email: "vijay.jabalpur@smartserve.ai",
    is_active: true,
    sales: 67000
  },
  "SS-NAPIER": {
    code: "SS-NAPIER",
    name: "SmartServe Napier Town",
    address: "Napier Town, Jabalpur, MP - 482001",
    latitude: 23.1615,
    longitude: 79.9261,
    admin_email: "napier.jabalpur@smartserve.ai",
    is_active: true,
    sales: 52000
  },
  "SS-GORAKH": {
    code: "SS-GORAKH",
    name: "SmartServe Gorakhpur Hub",
    address: "Gorakhpur Road, Jabalpur, MP - 482001",
    latitude: 23.1522,
    longitude: 79.9381,
    admin_email: "gorakh.jabalpur@smartserve.ai",
    is_active: true,
    sales: 89000
  }
};

export function loadLocalPostgresTables(): LocalRelationalData {
  if (fs.existsSync(POSTGRES_FALLBACK_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(POSTGRES_FALLBACK_FILE, "utf-8"));
      return {
        users: data.users || {},
        franchises: data.franchises || DEFAULT_FRANCHISES,
        orders: data.orders || {},
        shift_logs: data.shift_logs || [],
        carts: data.carts || {}
      };
    } catch {
      // Re-initialize below
    }
  }

  const initial: LocalRelationalData = {
    users: {},
    franchises: DEFAULT_FRANCHISES,
    orders: {},
    shift_logs: [],
    carts: {}
  };
  fs.writeFileSync(POSTGRES_FALLBACK_FILE, JSON.stringify(initial, null, 2));
  return initial;
}

export function saveLocalPostgresTables(data: LocalRelationalData): void {
  fs.writeFileSync(POSTGRES_FALLBACK_FILE, JSON.stringify(data, null, 2));
}

// ==========================================
// MASTER CONSOLIDATED DATA TRANSACTION INTERFACE (SAAS DECOUPLED OPERATIONS)
// ==========================================

export async function dbFetchUsers(): Promise<any[]> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT * FROM users ORDER BY created_at DESC");
    return rows;
  }
  const l = loadLocalPostgresTables();
  return Object.values(l.users);
}

export async function dbUpsertUser(phone: string, name: string, role: string = "Customer"): Promise<any> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query(
      `INSERT INTO users (phone, name, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
       RETURNING *`,
      [phone, name, role]
    );
    return rows[0];
  }
  const l = loadLocalPostgresTables();
  if (!l.users[phone]) {
    l.users[phone] = { phone, name, wallet_balance: 1800, role, created_at: new Date().toISOString() };
  } else {
    l.users[phone].name = name;
    l.users[phone].role = role;
  }
  saveLocalPostgresTables(l);
  return l.users[phone];
}

export async function dbFetchUserByPhone(phone: string): Promise<any | null> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    return rows[0] || null;
  }
  const l = loadLocalPostgresTables();
  return l.users[phone] || null;
}

export async function dbUpdateWalletBalance(phone: string, balance: number): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    await pgPool.query("UPDATE users SET wallet_balance = $1 WHERE phone = $2", [balance, phone]);
    return;
  }
  const l = loadLocalPostgresTables();
  if (l.users[phone]) {
    l.users[phone].wallet_balance = balance;
    saveLocalPostgresTables(l);
  }
}

export async function dbFetchMenu(): Promise<any[]> {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    try {
      const items = await mongoDb.collection("products").find({}).toArray();
      if (!items || items.length === 0) {
        console.log("MongoDB products collection is empty. Seeding default items...");
        await mongoDb.collection("products").insertMany(DEFAULT_MENU_ITEMS);
        return DEFAULT_MENU_ITEMS;
      }
      return items;
    } catch (err) {
      console.error("Failed to fetch menu from MongoDB, falling back to local storage:", err);
      return loadLocalMenu();
    }
  }
  return loadLocalMenu();
}

export async function dbSaveMenu(menu: any[]): Promise<void> {
  const mongoDb = await getMongoDb();
  if (mongoDb) {
    await mongoDb.collection("products").deleteMany({});
    if (menu.length > 0) {
      await mongoDb.collection("products").insertMany(menu);
    }
    return;
  }
  saveLocalMenu(menu);
}

function mapPgRowToOrder(r: any): any {
  if (!r) return null;
  let itemsVal = [];
  try {
    itemsVal = typeof r.items === "string" ? JSON.parse(r.items) : r.items;
  } catch (e) {
    itemsVal = r.items;
  }
  return {
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    pnr: r.pnr,
    trainNumber: r.train_number,
    trainName: r.train_name,
    deliveryStation: r.delivery_station,
    seatInfo: r.seat_info,
    deliveryAddress: r.delivery_address,
    branchCode: r.branch_code,
    branchName: r.branch_name,
    items: itemsVal,
    tax: Number(r.tax),
    deliveryCharge: Number(r.delivery_charge),
    discount: Number(r.discount),
    total: Number(r.total),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    stage: Number(r.stage),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    riderId: r.rider_id,
    riderName: r.rider_name,
    riderLat: Number(r.rider_lat),
    riderLon: Number(r.rider_lon),
    targetLat: Number(r.target_lat),
    targetLon: Number(r.target_lon),
    timeLeftSeconds: r.time_left_seconds !== null && r.time_left_seconds !== undefined ? Number(r.time_left_seconds) : 0,
  };
}

export async function dbFetchOrders(): Promise<any[]> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT * FROM orders ORDER BY created_at DESC");
    return rows.map(mapPgRowToOrder);
  }
  const l = loadLocalPostgresTables();
  return Object.values(l.orders).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function dbSaveOrdersList(orders: any[]): Promise<void> {
  // Mostly used to write back simulation batch updates
  const pgPool = await getPgPool();
  if (pgPool) {
    for (const o of orders) {
      await pgPool.query(
        `UPDATE orders SET 
          stage = $1, rider_lat = $2, rider_lon = $3, time_left_seconds = $4,
          rider_id = $5, rider_name = $6, payment_status = $7
         WHERE id = $8`,
        [o.stage, o.riderLat, o.riderLon, o.timeLeftSeconds, o.riderId, o.riderName, o.paymentStatus, o.id]
      );
    }
    return;
  }
  const l = loadLocalPostgresTables();
  orders.forEach(o => {
    l.orders[o.id] = o;
  });
  saveLocalPostgresTables(l);
}

export async function dbInsertOrder(o: any): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    // Save order record
    await pgPool.query(
      `INSERT INTO orders (
        id, customer_name, customer_phone, pnr, train_number, train_name,
        delivery_station, seat_info, delivery_address, branch_code, branch_name,
        items, tax, delivery_charge, discount, total, payment_method, payment_status,
        stage, rider_id, rider_name, rider_lat, rider_lon, target_lat, target_lon, time_left_seconds
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
      [
        o.id, o.customerName, o.customerPhone, o.pnr || null, o.trainNumber || null, o.trainName || null,
        o.deliveryStation || null, o.seatInfo || null, o.deliveryAddress || null, o.branchCode, o.branchName,
        JSON.stringify(o.items), o.tax, o.deliveryCharge, o.discount, o.total, o.paymentMethod, o.paymentStatus,
        o.stage, o.riderId || null, o.riderName || null, o.riderLat, o.riderLon, o.targetLat, o.targetLon, o.timeLeftSeconds
      ]
    );
    return;
  }
  const l = loadLocalPostgresTables();
  l.orders[o.id] = o;
  saveLocalPostgresTables(l);
}

export async function dbUpdateOrderDetails(orderId: string, fields: any): Promise<any> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    Object.keys(fields).forEach(key => {
      // camelCase conversion
      let colName = key;
      if (key === "riderLat") colName = "rider_lat";
      if (key === "riderLon") colName = "rider_lon";
      if (key === "riderId") colName = "rider_id";
      if (key === "riderName") colName = "rider_name";
      if (key === "paymentStatus") colName = "payment_status";

      sets.push(`${colName} = $${i}`);
      values.push(fields[key]);
      i++;
    });

    values.push(orderId);
    await pgPool.query(
      `UPDATE orders SET ${sets.join(", ")} WHERE id = $${i}`,
      values
    );
    const { rows } = await pgPool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    return mapPgRowToOrder(rows[0]);
  }

  const l = loadLocalPostgresTables();
  if (l.orders[orderId]) {
    l.orders[orderId] = { ...l.orders[orderId], ...fields };
    saveLocalPostgresTables(l);
    return l.orders[orderId];
  }
  return null;
}

export async function dbFetchFranchises(): Promise<any[]> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT * FROM franchises");
    return rows;
  }
  const l = loadLocalPostgresTables();
  return Object.values(l.franchises);
}

export async function dbInsertFranchise(f: any): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    await pgPool.query(
      `INSERT INTO franchises (code, name, address, latitude, longitude, admin_email, is_active, sales)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sales = EXCLUDED.sales`,
      [f.code, f.name, f.address, f.latitude, f.longitude, f.adminEmail, f.isActive, f.sales]
    );
    return;
  }
  const l = loadLocalPostgresTables();
  l.franchises[f.code] = f;
  saveLocalPostgresTables(l);
}

export async function dbIncrementFranchiseSales(code: string, salesAmount: number): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    await pgPool.query("UPDATE franchises SET sales = sales + $1 WHERE code = $2", [salesAmount, code]);
    return;
  }
  const l = loadLocalPostgresTables();
  if (l.franchises[code]) {
    l.franchises[code].sales += salesAmount;
    saveLocalPostgresTables(l);
  }
}

export async function dbFetchShiftLogs(): Promise<any[]> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT * FROM shift_logs");
    return rows;
  }
  const l = loadLocalPostgresTables();
  return l.shift_logs;
}

export async function dbPunchShiftLog(log: any): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    await pgPool.query(
      `INSERT INTO shift_logs (emp_id, emp_name, role, date, hours, checked_in, logged)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (emp_id, date) DO UPDATE SET checked_in = EXCLUDED.checked_in`,
      [log.empId, log.empName, log.role, log.date, log.hours, log.checkedIn, log.logged]
    );
    return;
  }
  const l = loadLocalPostgresTables();
  const existingIdx = l.shift_logs.findIndex(s => s.empId === log.empId && s.date === log.date);
  if (existingIdx > -1) {
    l.shift_logs[existingIdx].checkedIn = log.checkedIn;
  } else {
    l.shift_logs.push(log);
  }
  saveLocalPostgresTables(l);
}

export async function dbFetchUserCart(phone: string): Promise<any[]> {
  const pgPool = await getPgPool();
  if (pgPool) {
    const { rows } = await pgPool.query("SELECT cart_items FROM carts WHERE phone = $1", [phone]);
    return rows.length > 0 ? JSON.parse(rows[0].cart_items) : [];
  }
  const l = loadLocalPostgresTables();
  const raw = l.carts[phone];
  return raw ? JSON.parse(raw) : [];
}

export async function dbSaveUserCart(phone: string, cartItems: any[]): Promise<void> {
  const pgPool = await getPgPool();
  if (pgPool) {
    await pgPool.query(
      `INSERT INTO carts (phone, cart_items, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (phone) DO UPDATE SET cart_items = EXCLUDED.cart_items, updated_at = CURRENT_TIMESTAMP`,
      [phone, JSON.stringify(cartItems)]
    );
    return;
  }
  const l = loadLocalPostgresTables();
  l.carts[phone] = JSON.stringify(cartItems);
  saveLocalPostgresTables(l);
}
