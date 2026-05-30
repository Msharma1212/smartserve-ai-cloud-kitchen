export interface MenuItem {
  id: string;
  name: string;
  category: "Pizza" | "Burger" | "Wraps" | "Drinks";
  price: number;
  rating: number;
  isVeg: boolean;
  isJain: boolean;
  image: string;
  description: string;
  tags: string[];
}

export interface CartItem {
  id: string; // unique ID including customizations
  menuId: string;
  name: string;
  price: number;
  qty: number;
  size: "Regular" | "Medium" | "Large" | "Double Patty" | "Single Patty";
  toppings: string[];
  crust?: string;
  category: string;
  isVeg: boolean;
  image: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  customizations: string[];
  category: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pnr?: string;
  trainNumber?: string;
  trainName?: string;
  deliveryStation?: string;
  seatInfo?: string;
  deliveryAddress?: string;
  branchCode: string;
  branchName: string;
  items: OrderItem[];
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: "UPI" | "Card" | "Wallet" | "COD";
  paymentStatus: "Pending" | "Paid";
  stage: 1 | 2 | 3 | 4 | 5 | 6; // 1: Received, 2: Preparing, 3: In oven, 4: Packed, 5: Out for delivery, 6: Delivered
  createdAt: string;
  orderMode?: "dine-in" | "pickup" | "delivery" | "in-car" | "train";
  dineInTable?: string;
  inCarSpot?: string;
  inCarVehicle?: string;
  pickupTime?: string;
  riderId?: string;
  riderName?: string;
  riderLon: number;
  riderLat: number;
  targetLon: number;
  targetLat: number;
  timeLeftSeconds?: number;
}

export interface Franchise {
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  adminEmail: string;
  isActive: boolean;
  sales: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  status: "idle" | "delivering";
  currentLat: number;
  currentLon: number;
  totalDeliveries: number;
  totalEarnings: number;
  activeOrderId?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: "Founder" | "Franchise Admin" | "Kitchen Staff" | "Rider" | "Employee";
  hourlyRate: number;
  baseSalary: number;
  attendancePct: number;
  shiftLogs: Array<{ date: string; hours: number; checkedIn: boolean; logged: boolean }>;
}

export interface DBMetrics {
  postgres: {
    active_tables: string[];
    total_orders_rows: number;
    franchises_rows: number;
    status: string;
  };
  mongodb: {
    collections: string[];
    menu_collection_count: number;
    draft_applicants_count: number;
    status: string;
  };
  redis: {
    cache_ratio: string;
    hits: number;
    misses: number;
    cached_keys: string[];
    latency_saved: string;
    status: string;
  };
  socketIO: {
    connected_clients: number;
    broadcast_channel: string;
    active_listeners: string[];
    event_emit_count: number;
    status: string;
  };
}

export interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  distanceKm: number;
}

export interface TrainPNR {
  pnr: string;
  trainNo: string;
  trainName: string;
  coach: string;
  seat: number;
  journeyDate: string;
  routeStops: TrainStop[];
  currentDelayMins: number;
}
