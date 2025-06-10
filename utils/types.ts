export type OrderProducts = {
  id: number,
  title: string,
  price?: number,
  count: number,
};

export type Order = {
  products: OrderProducts[],
  id: string,
  userId?: number,
  tag?: number,
  title: string,
  count: number,
  orderMemberId: string,
};

export type Product = {
  tag?: number,
  count: number;
  special?: number,
  points: number,
  price: number,
  id: number | string,
  title: {
    ar: string,
    tr: string
  },
};

export type Deposit = {
  deptAmount: number;
  id: string;
  password: string,
  username: string,
  userId: string,
  isAdmin: boolean,
  products?: DepositProduct[],
  transactions?: Transaction[],
};

export type DepositProduct = {
  points: boolean;
  id: string;
  title: string;
  count: number;
  received: boolean;
}

export type Transaction = {
  id?: string;
  adminId?: string;
  amount: number; // Positive or negative
  note?: string;
  created_at: Date,
}

export type TransactionOrder = {
  id?: string,
  userId: string,
  amount: number,
  note?: string,
  created_at: Date,
};

export type Action = {
  userId: string;
  id?: string;
  adminId?: string;
  amount?: number; // positive and negative
  title: string;
  products: OrderProducts[];
  notes?: string;
  created_at: Date,
}

export const orderStatuses = [
  {
    title: "تم كلياً",
    details: {points: true, paid: true, received: true},
  },
  {
    title: "إستلمت ولم تنزل",
    details: {points: false, paid: true, received: true},
  },
  {
    title: "بقي استلام المنتج",
    details: {points: true, paid: true, received: false},
  },
  {
    title: "نزلت ولم تدفع",
    details: {points: true, paid: false, received: true},
  },
  {
    title: "نقاط بدون دفع او استلام",
    details: {points: true, paid: false, received: false},
  },
  {
    title: "دفعت فقط",
    details: {points: false, paid: true, received: false},
  },
  {
    title: "منتج سلفة",
    details: {points: false, paid: false, received: true},
  },
  {
    title: "طلب معلق",
    details: {points: false, paid: false, received: false},
  },
];