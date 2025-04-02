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
  password: string,
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