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
  categoryName?: string;
  subCategoryName?: string;
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

  updateTransaction(id: number, transaction: NewTransactionDTO): Observable<Transaction> {
    // On crée un nouvel objet qui contient TOUTES les infos du DTO + l'ID
    // Cela garantit que le backend reçoit l'ID même s'il le cherche dans le body
    const payload = { ...transaction, id: id };
    return this.http.put<Transaction>(`${this.apiUrl}`, payload);
  }

  // Supprimer une transaction (DELETE)
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
