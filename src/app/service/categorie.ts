import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  estimatedAmount: number;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}
@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(this.apiUrl);
  }

  getSubCategoriesByCategoryId(categoryId: number): Observable<{ subCategories: SubCategory[] }> {
    return this.http.get<{ subCategories: SubCategory[] }>(`${this.apiUrl}/${categoryId}`);
  }
}
