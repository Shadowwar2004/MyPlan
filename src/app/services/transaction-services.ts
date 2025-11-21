import { Injectable } from '@angular/core';
import { Transaction, Category } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private categories: Category[] = [
    {
      name: 'Alimentation',
      subcategories: ['Épicerie', 'Restaurant', 'Livraison', 'Café', 'Fast-food']
    },
    {
      name: 'Transport',
      subcategories: ['Essence', 'Transport en commun', 'Taxi/Uber', 'Entretien véhicule', 'Parking']
    },
    {
      name: 'Logement',
      subcategories: ['Loyer', 'Électricité', 'Eau', 'Internet', 'Charges', 'Assurance habitation']
    },
    {
      name: 'Santé',
      subcategories: ['Médecin', 'Médicaments', 'Dentiste', 'Optique', 'Hôpital']
    },
    {
      name: 'Loisirs',
      subcategories: ['Cinéma', 'Sport', 'Voyages', 'Shopping', 'Abonnements']
    },
    {
      name: 'Salaire',
      subcategories: ['Salaire principal', 'Bonus', 'Heures supplémentaires', 'Prime']
    },
    {
      name: 'Investissement',
      subcategories: ['Actions', 'Cryptomonnaie', 'Immobilier', 'Épargne', 'Placements']
    }
  ];

  getCategories(): Category[] {
    return this.categories;
  }

  getSubcategories(categoryName: string): string[] {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.subcategories : [];
  }
}
