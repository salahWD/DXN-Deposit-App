export type Order = {
  tag: number,
  count: number,
};

export type Product = {
  tag?: number,
  depositCount?: number;
  special?: number,
  price: number,
  id: number,
  title: {
    ar: string,
    tr: string
  },
};

export type Transaction = {
  amount: number,
  admin: string,
  date: Date,
};

export type Deposit = {
  password: string,
  orders?: Order[],
  products?: Product[],
  transactions?: Transaction[],
};