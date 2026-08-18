import fs from "fs";
import path from "path";
import { Order, OrderStatus, ShippingAddress, CartItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Initial Seed Orders for luxury demonstration in admin panel
const INITIAL_ORDERS: Order[] = [
  {
    orderId: 104821,
    id: 104821,
    orderNumber: "NIL-104821",
    userId: 1,
    addressId: 1,
    status: "delivered" as OrderStatus,
    totalAmount: 7490,
    placedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      name: "Ananya Sharma",
      phone: "+91 98765 43210",
      email: "ananya.sharma@example.com",
      address: "B-402, Lotus Boulevard, Sector 100",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201304"
    },
    paymentMethod: "upi",
    paymentStatus: "Success",
    items: [
      {
        orderItemId: 1,
        id: 1,
        productVariantId: 1,
        productId: 1,
        quantity: 1,
        priceAtPurchase: 7490,
        unitPrice: 7490,
        productName: "Indigo Pleat Anarkali Suit",
        sku: "NIL-INDIGO-SUIT-M",
        size: "M",
        color: "Indigo Navy",
        imageUrl: "/images/hero-festive.jpg"
      }
    ],
    payment: {
      paymentId: 9001,
      status: "Success",
      amount: 7490,
      currency: "INR",
      gatewayTransactionId: "UPI-984210948"
    }
  },
  {
    orderId: 104822,
    id: 104822,
    orderNumber: "NIL-104822",
    userId: 2,
    addressId: 2,
    status: "shipped" as OrderStatus,
    totalAmount: 4990,
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: {
      name: "Riya Verma",
      phone: "+91 98112 34567",
      email: "riya.verma@example.com",
      address: "12A, Civil Lines, Near Mall Road",
      city: "Kanpur",
      state: "Uttar Pradesh",
      postalCode: "208001"
    },
    paymentMethod: "card",
    paymentStatus: "Success",
    items: [
      {
        orderItemId: 2,
        id: 2,
        productVariantId: 2,
        productId: 2,
        quantity: 1,
        priceAtPurchase: 4990,
        unitPrice: 4990,
        productName: "Chanderi Silk Embroidered Kurti",
        sku: "NIL-CHANDERI-KURTI-L",
        size: "L",
        color: "Ivory Gold",
        imageUrl: "/images/category-kurtis.jpg"
      }
    ],
    payment: {
      paymentId: 9002,
      status: "Success",
      amount: 4990,
      currency: "INR",
      gatewayTransactionId: "CARD-8492049"
    }
  }
];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[OrdersStore] Directory initialization error:", err);
  }
}

export function readOrders(): Order[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(data) as Order[];
  } catch {
    return INITIAL_ORDERS;
  }
}

export function writeOrders(orders: Order[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("[OrdersStore] Write error:", err);
  }
}

export function createOrderRecord(payload: {
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied?: number;
  couponCode?: string;
  userId?: number;
}): Order {
  const currentOrders = readOrders();
  
  // Find highest existing orderId or start at 104825
  const maxId = currentOrders.reduce((max, o) => Math.max(max, o.orderId || o.id || 0), 104824);
  const newOrderId = maxId + 1;
  const now = new Date().toISOString();

  const newOrder: Order = {
    orderId: newOrderId,
    id: newOrderId,
    orderNumber: `NIL-${newOrderId}`,
    userId: payload.userId || 1,
    addressId: newOrderId,
    status: (payload.paymentMethod === "cod" ? "pending" : "confirmed") as OrderStatus,
    totalAmount: payload.totalAmount,
    placedAt: now,
    createdAt: now,
    updatedAt: now,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentStatus || (payload.paymentMethod === "cod" ? "Pending" : "Success"),
    discountApplied: payload.discountApplied || 0,
    items: payload.items.map((item, idx) => ({
      orderItemId: newOrderId * 10 + idx + 1,
      id: newOrderId * 10 + idx + 1,
      productVariantId: item.variantId || item.productId,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.basePrice,
      unitPrice: item.basePrice,
      productName: item.name,
      sku: `NIL-${item.slug.toUpperCase()}-${item.size}`,
      size: item.size,
      color: "Standard",
      imageUrl: item.image
    })),
    payment: {
      paymentId: newOrderId + 9000,
      status: (payload.paymentStatus || (payload.paymentMethod === "cod" ? "Pending" : "Success")) as import("./types").PaymentStatus,
      amount: payload.totalAmount,
      currency: "INR",
      gatewayTransactionId: payload.transactionId || `NIL-TXN-${Date.now()}`
    }
  };

  currentOrders.unshift(newOrder); // Add to top of orders list
  writeOrders(currentOrders);
  return newOrder;
}

export function updateOrderStatusInStore(orderId: number, newStatus: OrderStatus): Order | null {
  const orders = readOrders();
  const index = orders.findIndex((o) => (o.orderId || o.id) === orderId);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };
  writeOrders(orders);
  return orders[index];
}
