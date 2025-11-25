// src/app/models/transaction.model.ts
export interface Transaction {
  id?: number;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE'; // Uniquement en majuscules pour correspondre au backend
  category: string;
  subcategory: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface BalanceResponse {
  balance: number;
}
