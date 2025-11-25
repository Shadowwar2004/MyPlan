import {inject, Injectable} from '@angular/core';
import {
  Transaction,
  Category,
  CategoriesResponse,
  TransactionsResponse,
  BalanceResponse
} from '../models/transaction.model';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  httpClient: HttpClient = inject(HttpClient);

  static readonly CATEGORIES_ENDPOINT: string = "categories";
  static readonly TRANSACTIONS_ENDPOINT: string = "transactions";

  static readonly CATEGORIES_URL: string = environment.API_BASE_URL + "/" + TransactionService.CATEGORIES_ENDPOINT;
  static readonly TRANSACTIONS_URL: string = environment.API_BASE_URL + "/" + TransactionService.TRANSACTIONS_ENDPOINT;

  // Catégories
  getCategories(): Observable<Category[]> {
    return this.httpClient.get<CategoriesResponse>(TransactionService.CATEGORIES_URL)
      .pipe(
        map((response: CategoriesResponse) => response.categories)
      );
  }

  getSubcategories(categoryId: number): Observable<string[]> {
    return this.httpClient.get<string[]>(`${TransactionService.CATEGORIES_URL}/${categoryId}/subcategories`);
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.httpClient.get<TransactionsResponse>(TransactionService.TRANSACTIONS_URL)
      .pipe(
        map((response: TransactionsResponse) => response.transactions)
      );
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.httpClient.get<Transaction>(`${TransactionService.TRANSACTIONS_URL}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.httpClient.post<Transaction>(TransactionService.TRANSACTIONS_URL, transaction);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.httpClient.put<Transaction>(`${TransactionService.TRANSACTIONS_URL}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${TransactionService.TRANSACTIONS_URL}/${id}`);
  }

  // Statistiques
  getBalance(): Observable<number> {
    return this.httpClient.get<BalanceResponse>(`${TransactionService.TRANSACTIONS_URL}/balance`)
      .pipe(
        map((response: BalanceResponse) => response.balance)
      );
  }
}
