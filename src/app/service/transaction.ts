// TypeScript
// Salut ! Ce fichier gère les transactions (l'argent).
// Je n'ai rien changé au code, j'ai juste ajouté des explications simples.

// Importe des choses utiles d'Angular et RxJS
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

// Définition d'une transaction (une ligne d'argent)
export interface Transaction {
  id: number; // identifiant unique de la transaction
  date_operation: Date; // la date quand l'argent a bougé
  montant_operation: number; // Montant en long/entier (centimes) — combien d'argent
  type_operation: 'depense' | 'revenu'; // est-ce une dépense ou un revenu ?
  category_transaction_id: number; // id de la catégorie (ex: nourriture)
  subcategory_transaction_id: number; // id de la sous-catégorie (ex: restaurant)
  categoryName?: string; // nom de la catégorie (optionnel, pour l'affichage)
  subCategoryName?: string; // nom de la sous-catégorie (optionnel, pour l'affichage)
}

// Objet pour créer ou mettre à jour une transaction (ce que le backend attend)
export interface NewTransactionDTO {
  date_operation: string; // Format ISO pour le backend (texte de date)
  montant_operation: number; // montant en centimes
  type_operation: 'depense' | 'revenu'; // dépense ou revenu
  category_transaction_id: number; // id de la catégorie choisie
  subcategory_transaction_id: number; // id de la sous-catégorie choisie
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  // L'adresse de l'API (où on envoie les requêtes)
  private apiUrl = `${environment.apiUrl}/transactions`;

  // Le constructeur prépare l'objet pour faire des requêtes HTTP
  constructor(private http: HttpClient) { }

  // Récupère toutes les transactions depuis le serveur
  getAllTransactions(): Observable<{ transactions: Transaction[] }> {
    return this.http.get<{ transactions: Transaction[] }>(this.apiUrl);
  }

  // Crée une nouvelle transaction (envoie les données au serveur)
  createTransaction(newTransaction: NewTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, newTransaction);
  }

  // Met à jour une transaction existante
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
