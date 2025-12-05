import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';


export interface Transaction {
  id: number;
  date_operation: Date;
  montant_operation: number; // Montant en long/entier (centimes)
  type_operation: 'depense' | 'revenu';
  category_transaction_id: number;
  subcategory_transaction_id: number;
}
export interface NewTransactionDTO {
  date_operation: string; // Format ISO pour le backend
  montant_operation: number;
  type_operation: 'depense' | 'revenu';
  category_transaction_id: number;
  subcategory_transaction_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) { }

  getAllTransactions(): Observable<{ transactions: Transaction[] }> {
    return this.http.get<{ transactions: Transaction[] }>(this.apiUrl);
  }

  createTransaction(newTransaction: NewTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, newTransaction);
  }
}
