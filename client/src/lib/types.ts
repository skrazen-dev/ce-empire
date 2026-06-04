export interface BankAccount {
  id: string;
  bankCode: string;
  accountNo: string;
  firstName: string;
  lastName: string;
  linkedPhone: string;
  pin: string;
  paidAmount: number;
  dueAmount: number;
  virtual1?: VirtualCard;
  virtual2?: VirtualCard;
  walletAccounts?: string[];
  thumbImage?: string;
  cardImage?: string;
  isDormant?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualCard {
  number: string;
  expire: string;
  cvc: string;
}

export interface Expense {
  id: string;
  accountId?: string;
  agentId?: string;
  description: string;
  amount: number;
  type: 'paid' | 'pending';
  category?: string;
  note?: string;
  slipImage?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  createdAt: string;
}

export type PageId = 'dashboard' | 'accounts' | 'expenses' | 'agents' | 'status' | 'proof';
