import { UserType } from "@/redux/reducers/badgesReducer";

export type Wallet = {
  id: number;
  point: number;
  userId: string;
  checkAt: string;
  buyerAmount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullname: string;
    imageUrl: string;
  };
};

export type NextType = UserType;

export type TypeUser = {
  wallet: Wallet;
  userType: UserType;
  nextType: NextType;
};

type HistoryEntryStatus = "valid" | "refund" | "sentGift" | "receivedGift";

export type HistoryEntry = {
  id: number;
  walletId: number;
  point: number;
  remainingPoint: number;
  paymentamount: number;
  brandId: number;
  brand: {
    id: number;
    name: string;
    logo?: string;
  };
  status: HistoryEntryStatus;
  brandAmount: number;
  type: "PAYMENT" | "GIFT" | "RECHARGE";
  validTo?: string;
  validFrom?: string;
  invoice?: string;
  mostasmer?: number;
  user?: number;
  createdAt: string;
  updatedAt: string;
  wallet?: Wallet;
  OfferDetialsWalletHistory: { ratio: number; type: string }[];
  pointToSr: number;
};

export type Transaction = {
  payment: number;
  gift: number;
  recharge: number;
  total: number;
};

export type WalletData = {
  history: HistoryEntry[];
  transaction: Transaction;
};

export const roleKeywordsEn = [
  "admin",
  "customer",
  "employee",
  "brand representative",
];
export const roleKeywordsAr = [
  "العملاء",
  "مسؤل",
  "ممثل العلامة التجارية",
  "موظف",
];
