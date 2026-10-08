import type { AdminRole } from "./roles";

export type AdminStatus = "active" | "inactive" | "invited";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  whatsappNumber: string | null;
  avatarUrl: string | null;
  role: AdminRole;
  status: AdminStatus;
  isOnDuty: boolean;
  createdAt: string;
  lastActiveAt: string | null;
};

export type OrderUiStatus =
  | "Pending"
  | "Confirmed"
  | "Active"
  | "Delivered"
  | "Cancelled";

export type OrderDetailStatus =
  | "received"
  | "confirmed"
  | "shopping"
  | "ready"
  | "delivered";

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  image: string;
  lineTotal: number;
};

export type Order = {
  id: string;
  shortId: string;
  uiStatus: OrderUiStatus;
  status: string;
  detailStatus: OrderDetailStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
  paidAt: string | null;
  itemsCount: number;
  subtotal: number;
  agentFee: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress: string;
  orderItems: OrderItem[];
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  category: string;
  amount: string;
  currentPrice: number;
  dateAdded: string;
  image: string;
  description: string;
  inStock: boolean;
};

export type Customer = {
  id: string;
  name: string | null;
  whatsappNumber: string;
  ordersCount: number;
  messagesCount: number;
  lastOrderAt: string | null;
  lastOrderTotal: number | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  createdAt: string;
  whatsappMessageId: string | null;
};

export type Conversation = {
  customerId: string;
  name: string | null;
  whatsappNumber: string;
  mode: "human" | "bot";
  assignedAdmin: { id: string; name: string | null; email: string } | null;
  lastMessage: ChatMessage | null;
  updatedAt: string;
  messages: ChatMessage[];
};

export const CURRENT_ADMIN: AdminUser = {
  id: "admin-1",
  name: "Adaeze Mensah",
  email: "adaeze@netan.tech",
  phone: "+2348012345678",
  whatsappNumber: "+2348012345678",
  avatarUrl: null,
  role: "superadmin",
  status: "active",
  isOnDuty: true,
  createdAt: "2026-01-12T10:00:00.000Z",
  lastActiveAt: "2026-09-15T09:12:00.000Z",
};

export const MOCK_ADMINS: AdminUser[] = [
  CURRENT_ADMIN,
  {
    id: "admin-2",
    name: "Chinedu Okeke",
    email: "chinedu@netan.tech",
    phone: "+2348098765432",
    whatsappNumber: "+2348098765432",
    avatarUrl: null,
    role: "admin",
    status: "active",
    isOnDuty: true,
    createdAt: "2026-03-04T14:20:00.000Z",
    lastActiveAt: "2026-09-14T16:40:00.000Z",
  },
  {
    id: "admin-3",
    name: "Fatima Bello",
    email: "fatima@netan.tech",
    phone: "+2347011122233",
    whatsappNumber: "+2347011122233",
    avatarUrl: null,
    role: "customer_care",
    status: "invited",
    isOnDuty: false,
    createdAt: "2026-08-22T09:00:00.000Z",
    lastActiveAt: null,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Premium rice",
    unit: "per bag",
    category: "Grains",
    amount: "₦48,000",
    currentPrice: 48000,
    dateAdded: "12 Jan 2026",
    image: "",
    description: "50kg bag of long grain rice.",
    inStock: true,
  },
  {
    id: "prod-2",
    name: "Vegetable oil",
    unit: "per 5L",
    category: "Oil and sauces",
    amount: "₦9,500",
    currentPrice: 9500,
    dateAdded: "18 Feb 2026",
    image: "",
    description: "Refined vegetable oil.",
    inStock: true,
  },
  {
    id: "prod-3",
    name: "Tomato paste",
    unit: "per carton",
    category: "Canned goods",
    amount: "₦12,800",
    currentPrice: 12800,
    dateAdded: "02 Mar 2026",
    image: "",
    description: "Carton of tomato paste tins.",
    inStock: false,
  },
  {
    id: "prod-4",
    name: "Malt drink",
    unit: "per crate",
    category: "Beverages",
    amount: "₦7,200",
    currentPrice: 7200,
    dateAdded: "21 Apr 2026",
    image: "",
    description: "Crate of malt drinks.",
    inStock: true,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    shortId: "NT-1042",
    uiStatus: "Pending",
    status: "pending",
    detailStatus: "received",
    paymentStatus: "unpaid",
    createdAt: "2026-09-14T08:15:00.000Z",
    paidAt: null,
    itemsCount: 3,
    subtotal: 24500,
    agentFee: 500,
    deliveryFee: 1500,
    total: 26500,
    customerName: "Ifeanyi Nnamdi",
    customerPhone: "+2348033311122",
    deliveryMethod: "Home delivery",
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    orderItems: [
      {
        id: "oi-1",
        name: "Premium rice",
        quantity: 1,
        unit: "per bag",
        image: "",
        lineTotal: 4800,
      },
      {
        id: "oi-2",
        name: "Vegetable oil",
        quantity: 2,
        unit: "per 5L",
        image: "",
        lineTotal: 19000,
      },
    ],
  },
  {
    id: "ord-2",
    shortId: "NT-1038",
    uiStatus: "Active",
    status: "shopping",
    detailStatus: "shopping",
    paymentStatus: "paid",
    createdAt: "2026-09-12T11:40:00.000Z",
    paidAt: "2026-09-12T11:48:00.000Z",
    itemsCount: 2,
    subtotal: 14400,
    agentFee: 500,
    deliveryFee: 1200,
    total: 16100,
    customerName: "Amaka Eze",
    customerPhone: "+2348094455667",
    deliveryMethod: "Pickup",
    deliveryAddress: "Netan warehouse, Ikeja",
    orderItems: [
      {
        id: "oi-3",
        name: "Malt drink",
        quantity: 2,
        unit: "per crate",
        image: "",
        lineTotal: 14400,
      },
    ],
  },
  {
    id: "ord-3",
    shortId: "NT-1021",
    uiStatus: "Delivered",
    status: "delivered",
    detailStatus: "delivered",
    paymentStatus: "paid",
    createdAt: "2026-08-28T16:05:00.000Z",
    paidAt: "2026-08-28T16:10:00.000Z",
    itemsCount: 1,
    subtotal: 12800,
    agentFee: 500,
    deliveryFee: 1000,
    total: 14300,
    customerName: "Hassan Ibrahim",
    customerPhone: "+2347019988776",
    deliveryMethod: "Home delivery",
    deliveryAddress: "7 Ahmadu Bello Way, Abuja",
    orderItems: [
      {
        id: "oi-4",
        name: "Tomato paste",
        quantity: 1,
        unit: "per carton",
        image: "",
        lineTotal: 12800,
      },
    ],
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Ifeanyi Nnamdi",
    whatsappNumber: "+2348033311122",
    ordersCount: 4,
    messagesCount: 18,
    lastOrderAt: "2026-09-14T08:15:00.000Z",
    lastOrderTotal: 26500,
    createdAt: "2026-02-11T09:00:00.000Z",
  },
  {
    id: "cust-2",
    name: "Amaka Eze",
    whatsappNumber: "+2348094455667",
    ordersCount: 2,
    messagesCount: 9,
    lastOrderAt: "2026-09-12T11:40:00.000Z",
    lastOrderTotal: 16100,
    createdAt: "2026-04-03T12:30:00.000Z",
  },
  {
    id: "cust-3",
    name: "Hassan Ibrahim",
    whatsappNumber: "+2347019988776",
    ordersCount: 1,
    messagesCount: 5,
    lastOrderAt: "2026-08-28T16:05:00.000Z",
    lastOrderTotal: 14300,
    createdAt: "2026-08-20T10:00:00.000Z",
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    customerId: "cust-1",
    name: "Ifeanyi Nnamdi",
    whatsappNumber: "+2348033311122",
    mode: "bot",
    assignedAdmin: null,
    updatedAt: "2026-09-14T08:20:00.000Z",
    lastMessage: {
      id: "msg-2",
      body: "Please confirm my rice order.",
      direction: "inbound",
      createdAt: "2026-09-14T08:20:00.000Z",
      whatsappMessageId: "wa-2",
    },
    messages: [
      {
        id: "msg-1",
        body: "Hi, I would like to order a bag of rice.",
        direction: "inbound",
        createdAt: "2026-09-14T08:10:00.000Z",
        whatsappMessageId: "wa-1",
      },
      {
        id: "msg-2",
        body: "Please confirm my rice order.",
        direction: "inbound",
        createdAt: "2026-09-14T08:20:00.000Z",
        whatsappMessageId: "wa-2",
      },
    ],
  },
  {
    customerId: "cust-2",
    name: "Amaka Eze",
    whatsappNumber: "+2348094455667",
    mode: "human",
    assignedAdmin: {
      id: CURRENT_ADMIN.id,
      name: CURRENT_ADMIN.name,
      email: CURRENT_ADMIN.email,
    },
    updatedAt: "2026-09-12T12:05:00.000Z",
    lastMessage: {
      id: "msg-5",
      body: "Your order is being packed now.",
      direction: "outbound",
      createdAt: "2026-09-12T12:05:00.000Z",
      whatsappMessageId: "wa-5",
    },
    messages: [
      {
        id: "msg-3",
        body: "Can I pick up today?",
        direction: "inbound",
        createdAt: "2026-09-12T11:50:00.000Z",
        whatsappMessageId: "wa-3",
      },
      {
        id: "msg-4",
        body: "Yes, pickup is available after 2pm.",
        direction: "outbound",
        createdAt: "2026-09-12T11:58:00.000Z",
        whatsappMessageId: "wa-4",
      },
      {
        id: "msg-5",
        body: "Your order is being packed now.",
        direction: "outbound",
        createdAt: "2026-09-12T12:05:00.000Z",
        whatsappMessageId: "wa-5",
      },
    ],
  },
];

export const MOCK_REVENUE_BY_YEAR: Record<
  string,
  { month: string; revenue: number; income: number }[]
> = {
  "2025": [
    { month: "Jan", revenue: 180000, income: 142000 },
    { month: "Feb", revenue: 210000, income: 168000 },
    { month: "Mar", revenue: 195000, income: 151000 },
    { month: "Apr", revenue: 240000, income: 190000 },
    { month: "May", revenue: 265000, income: 210000 },
    { month: "Jun", revenue: 250000, income: 198000 },
    { month: "Jul", revenue: 280000, income: 221000 },
    { month: "Aug", revenue: 310000, income: 246000 },
    { month: "Sep", revenue: 295000, income: 232000 },
    { month: "Oct", revenue: 330000, income: 264000 },
    { month: "Nov", revenue: 360000, income: 288000 },
    { month: "Dec", revenue: 410000, income: 325000 },
  ],
  "2026": [
    { month: "Jan", revenue: 320000, income: 255000 },
    { month: "Feb", revenue: 340000, income: 272000 },
    { month: "Mar", revenue: 355000, income: 284000 },
    { month: "Apr", revenue: 370000, income: 296000 },
    { month: "May", revenue: 390000, income: 312000 },
    { month: "Jun", revenue: 410000, income: 328000 },
    { month: "Jul", revenue: 435000, income: 348000 },
    { month: "Aug", revenue: 450000, income: 360000 },
    { month: "Sep", revenue: 280000, income: 224000 },
    { month: "Oct", revenue: 0, income: 0 },
    { month: "Nov", revenue: 0, income: 0 },
    { month: "Dec", revenue: 0, income: 0 },
  ],
};

export const MOCK_STATS = {
  pendingOrders: 1,
  totalOrders: MOCK_ORDERS.length,
  totalCustomers: MOCK_CUSTOMERS.length,
  totalProducts: MOCK_PRODUCTS.length,
};

export type Payment = {
  id: string;
  client: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
};

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    client: "Ifeanyi Nnamdi",
    amount: 26500,
    method: "Bank transfer",
    status: "Paid",
    date: "2026-09-14T08:15:00.000Z",
  },
  {
    id: "pay-2",
    client: "Amaka Eze",
    amount: 16100,
    method: "Card",
    status: "Paid",
    date: "2026-09-12T11:48:00.000Z",
  },
  {
    id: "pay-3",
    client: "Hassan Ibrahim",
    amount: 14300,
    method: "Bank transfer",
    status: "Pending",
    date: "2026-08-28T16:10:00.000Z",
  },
];

export type ReportRow = {
  id: string;
  label: string;
  value: string;
  change: string;
};

export const MOCK_REPORTS: ReportRow[] = [
  { id: "rep-1", label: "Monthly revenue", value: "₦280,000", change: "+10%" },
  { id: "rep-2", label: "Collected payments", value: "₦56,900", change: "+6%" },
  { id: "rep-3", label: "Active clients", value: "3", change: "+1" },
  { id: "rep-4", label: "Outstanding invoices", value: "₦14,300", change: "-2%" },
];

