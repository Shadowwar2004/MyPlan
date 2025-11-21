// src/app/models/transaction.model.ts
export interface Transaction {
  id?: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory: string;
  description?: string;
}

export interface Category {
  name: string;
  subcategories: string[];
}
