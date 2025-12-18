import {Component, OnInit} from '@angular/core';
import {Transaction, TransactionService} from '../../service/transaction';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {CategoriesService, Category, SubCategory} from '../../service/categorie';
import {forkJoin, Observable} from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    CommonModule
  ],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary implements OnInit {
  transactions: Transaction[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;


  constructor(private transactionService: TransactionService, private categoriesServices: CategoriesService) {
  }

  ngOnInit(): void {
    this.transactionService.getAllTransactions().subscribe(data => {
      this.transactions = data.transactions;
      this.enrichTransactionsWithCategoryNames();
    });
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.itemsPerPage);
  }

  // Transactions à afficher sur la page actuelle
  get paginatedTransactions(): Transaction[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.transactions.slice(startIndex, endIndex);
  }

  // Générer un tableau de numéros de page pour l'affichage
  get pageNumbers(): number[] {
    // Créer un tableau de 1 à totalPages
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Changer de page (Cette méthode doit s'assurer que la page est valide)
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Optionnel: Faire défiler la page vers le haut si la liste est longue
      // window.scrollTo(0, 0);
    }
  }

  // Passer à la page suivante
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Revenir à la page précédente
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }





  enrichTransactionsWithCategoryNames() {
    if (this.transactions.length === 0) {
      return;
    }

    const categoryRequests: { [key: number]: Observable<Category> } = {};
    const subCategoryRequests: { [key: string]: Observable<SubCategory> } = {};


    this.transactions.forEach(t => {
      if (t.category_transaction_id && !categoryRequests[t.category_transaction_id]) {

        categoryRequests[t.category_transaction_id] = this.categoriesServices.getCategoryById(t.category_transaction_id);
      }
      if (t.category_transaction_id && t.subcategory_transaction_id) {

        const key = `${t.category_transaction_id}-${t.subcategory_transaction_id}`;
        if (!subCategoryRequests[key]) {
          subCategoryRequests[key] = this.categoriesServices.getSubCategoryById(t.subcategory_transaction_id, t.category_transaction_id);
        }
      }
    });
    const allRequests = {
      ...categoryRequests,
      ...subCategoryRequests,
    };

    if (Object.keys(allRequests).length > 0) {
      forkJoin(allRequests).subscribe(
        (results: { [key: string]: Category | SubCategory }) => {
          this.transactions = this.transactions.map(t => {
            const categoryName = t.category_transaction_id

              ? (results[t.category_transaction_id.toString()] as Category)?.name || 'Inconnue'
              : undefined;

            const subCategoryName = (t.category_transaction_id && t.subcategory_transaction_id)
              ? (results[`${t.category_transaction_id}-${t.subcategory_transaction_id}`] as SubCategory)?.name || 'Inconnue'
              : undefined;

            return {
              ...t,
              categoryName,
              subCategoryName
            } as Transaction;
          });
        });
    }
  }
}





