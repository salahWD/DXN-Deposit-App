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
  price: number,
  id: number,
  title: {
    ar: string,
    tr: string
  },
};

export type Deposit = {
  member_code: string;
  password: string,
  username: string,
  isAdmin: boolean,
  products?: DepositProduct[],
  transactions?: Transaction[],
};

export type DepositProduct = {
  id: string | number;
  title: string;
  count: number;
  paid: boolean;
  received: boolean;
  points: boolean;
}

export type Transaction = {
  id: string;
  adminId: string;
  amount: number; // Positive or negative
  date: string;
  note?: string;
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