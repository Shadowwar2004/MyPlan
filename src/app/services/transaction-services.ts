import {inject, Injectable} from '@angular/core';
import {Transaction, Category, CategoriesResponse} from '../models/transaction.model';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  httpClient: HttpClient = inject(HttpClient);
  static readonly ENDPOINT_NAME: string = "categories";
  static readonly ENDPOINT_URL: string = environment.API_BASE_URL + "/" + TransactionService.ENDPOINT_NAME;

  getCategories(): Observable<Category[]> {
    return this.httpClient.get<CategoriesResponse>(TransactionService.ENDPOINT_URL)
      .pipe(
        map((response: CategoriesResponse) => response.categories)
      )
  }

  /*getSubcategories(categoryName: string): string[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.subcategories : [];
  }*/
}
