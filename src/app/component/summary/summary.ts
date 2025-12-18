import { Component, OnInit } from '@angular/core';
import { Transaction, TransactionService, NewTransactionDTO } from '../../service/transaction';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CategoriesService, Category, SubCategory } from '../../service/categorie';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary implements OnInit {
  transactions: Transaction[] = [];

  // Listes pour les selects
  categories: Category[] = [];
  subCategories: SubCategory[] = []; // <--- NOUVEAU : Liste pour le filtre
  subCategoriesForEdit: SubCategory[] = [];

  // --- Filtres ---
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null; // <--- NOUVEAU : ID sélectionné

  filterMinPrice: number = 0;
  filterMaxPrice: number = 10000;
  globalMinAmount: number = 0;
  globalMaxAmount: number = 0;

  // Pagination & Modals (inchangé)
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isEditModalOpen: boolean = false;
  editingTransactionId: number | null = null;

  editForm: NewTransactionDTO = {
    date_operation: '',
    montant_operation: 0,
    type_operation: 'depense',
    category_transaction_id: 0,
    subcategory_transaction_id: 0
  };

  constructor(
    private transactionService: TransactionService,
    private categoriesServices: CategoriesService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.categoriesServices.getAllCategories().subscribe(data => {
      this.categories = data.categories;
    });
  }

  // ... (loadTransactions, deleteTransaction, openEditModal, closeEditModal, saveEdit, onEditCategoryChange : inchangés) ...
  // Copiez-collez les méthodes existantes ici (loadTransactions, etc.)

  // --- LOGIQUE FILTRES ---

  // Appelé quand on change la CATÉGORIE dans le filtre
  onCategoryFilterChange(): void {
    this.selectedSubCategoryId = null; // On reset la sous-cat
    this.subCategories = []; // On vide la liste
    this.currentPage = 1; // Retour page 1

    if (this.selectedCategoryId) {
      // Charger les sous-catégories correspondantes
      this.categoriesServices.getSubCategoriesByCategoryId(this.selectedCategoryId).subscribe(data => {
        this.subCategories = data.subCategories;
      });
    }
  }

  // Appelé quand on change la SOUS-CATÉGORIE ou le PRIX
  onFilterChange(): void {
    this.currentPage = 1;
  }

  get filteredTransactions(): Transaction[] {
    return this.transactions.filter(t => {
      // 1. Filtre Catégorie
      const matchCategory = this.selectedCategoryId
        ? t.category_transaction_id == this.selectedCategoryId
        : true;

      // 2. Filtre Sous-Catégorie (NOUVEAU)
      const matchSubCategory = this.selectedSubCategoryId
        ? t.subcategory_transaction_id == this.selectedSubCategoryId
        : true;

      // 3. Filtre Prix
      const matchPrice = t.montant_operation >= this.filterMinPrice &&
        t.montant_operation <= this.filterMaxPrice;

      return matchCategory && matchSubCategory && matchPrice;
    });
  }

  // ... (Les getters de pagination et enrichTransactionsWithCategoryNames restent inchangés) ...

  // Assurez-vous d'avoir les méthodes loadTransactions, deleteTransaction, openEditModal, closeEditModal, saveEdit, onEditCategoryChange
  // et les getters (totalPages, paginatedTransactions, etc.) comme dans le code précédent.

  // Pour éviter de perdre du code, je remets les méthodes essentielles raccourcies :
  loadTransactions() {
    this.transactionService.getAllTransactions().subscribe(data => {
      this.transactions = data.transactions.sort((a, b) => new Date(b.date_operation).getTime() - new Date(a.date_operation).getTime());
      if (this.transactions.length > 0) {
        const amounts = this.transactions.map(t => t.montant_operation);
        this.globalMinAmount = Math.min(...amounts);
        this.globalMaxAmount = Math.max(...amounts);
        if(this.filterMaxPrice === 10000) { this.filterMinPrice = this.globalMinAmount; this.filterMaxPrice = this.globalMaxAmount; }
      }
      this.enrichTransactionsWithCategoryNames();
    });
  }

  deleteTransaction(t: Transaction) { /* ... Code précédent ... */ if(confirm('Supprimer ?')) this.transactionService.deleteTransaction(t.id).subscribe(() => this.loadTransactions()); }

  openEditModal(t: Transaction) { /* ... Code précédent ... */
    this.editingTransactionId = t.id;
    this.onEditCategoryChange(t.category_transaction_id);
    const dateStr = new Date(t.date_operation).toISOString().split('T')[0];
    this.editForm = { date_operation: dateStr, montant_operation: t.montant_operation, type_operation: t.type_operation, category_transaction_id: t.category_transaction_id, subcategory_transaction_id: t.subcategory_transaction_id };
    this.isEditModalOpen = true;
  }
  closeEditModal() { this.isEditModalOpen = false; this.editingTransactionId = null; }
  saveEdit() { if (this.editingTransactionId) this.transactionService.updateTransaction(this.editingTransactionId, this.editForm).subscribe(() => { this.closeEditModal(); this.loadTransactions(); }); }
  onEditCategoryChange(catId: number) {
    this.editForm.category_transaction_id = catId;
    if (catId) { this.categoriesServices.getSubCategoriesByCategoryId(catId).subscribe(data => { this.subCategoriesForEdit = data.subCategories; }); } else { this.subCategoriesForEdit = []; }
  }

  get totalPages(): number { return Math.ceil(this.filteredTransactions.length / this.itemsPerPage) || 1; }
  get paginatedTransactions(): Transaction[] { const startIndex = (this.currentPage - 1) * this.itemsPerPage; return this.filteredTransactions.slice(startIndex, startIndex + this.itemsPerPage); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  previousPage(): void { this.goToPage(this.currentPage - 1); }

  enrichTransactionsWithCategoryNames() {
    if (this.transactions.length === 0) return;
    const categoryRequests: { [key: number]: Observable<Category> } = {};
    const subCategoryRequests: { [key: string]: Observable<SubCategory> } = {};
    this.transactions.forEach(t => {
      if (t.category_transaction_id && !categoryRequests[t.category_transaction_id]) categoryRequests[t.category_transaction_id] = this.categoriesServices.getCategoryById(t.category_transaction_id);
      if (t.category_transaction_id && t.subcategory_transaction_id) { const key = `${t.category_transaction_id}-${t.subcategory_transaction_id}`; if (!subCategoryRequests[key]) subCategoryRequests[key] = this.categoriesServices.getSubCategoryById(t.subcategory_transaction_id, t.category_transaction_id); }
    });
    const allRequests = { ...categoryRequests, ...subCategoryRequests };
    if (Object.keys(allRequests).length > 0) {
      forkJoin(allRequests).subscribe((results: any) => {
        this.transactions = this.transactions.map(t => {
          const categoryName = t.category_transaction_id ? results[t.category_transaction_id.toString()]?.name || 'Inconnue' : undefined;
          const subCategoryName = (t.category_transaction_id && t.subcategory_transaction_id) ? results[`${t.category_transaction_id}-${t.subcategory_transaction_id}`]?.name || 'Inconnue' : undefined;
          return { ...t, categoryName, subCategoryName };
        });
      });
    }
  }
}
