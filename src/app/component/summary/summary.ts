// TypeScript
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
  // Ici on garde toutes les transactions (les lignes d'argent)
  transactions: Transaction[] = [];

  // Listes pour les menus déroulants (select)
  categories: Category[] = [];
  subCategories: SubCategory[] = []; // Sous-catégories pour le filtre
  subCategoriesForEdit: SubCategory[] = []; // Sous-catégories pour le formulaire d'édition

  // --- Filtres ---
  selectedCategoryId: number | null = null; // La catégorie choisie dans le filtre
  selectedSubCategoryId: number | null = null; // La sous-catégorie choisie

  filterMinPrice: number = 0; // Prix min du filtre
  filterMaxPrice: number = 10000; // Prix max du filtre
  globalMinAmount: number = 0; // Le plus petit montant parmi toutes les transactions
  globalMaxAmount: number = 0; // Le plus grand montant parmi toutes les transactions

  // Pagination & Modals (fenêtre d'édition)
  currentPage: number = 1; // page courante
  itemsPerPage: number = 5; // combien d'items par page
  isEditModalOpen: boolean = false; // est-ce que la fenêtre d'édition est ouverte ?
  editingTransactionId: number | null = null; // id de la transaction qu'on édite

  // Formulaire d'édition (valeurs par défaut)
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

  // Quand le composant démarre, on charge les données
  ngOnInit(): void {
    this.loadTransactions(); // charge toutes les transactions
    // charge toutes les catégories pour remplir le select
    this.categoriesServices.getAllCategories().subscribe(data => {
      this.categories = data.categories;
    });
  }

  // --- LOGIQUE FILTRES ---

  // Quand on change la catégorie dans le filtre
  onCategoryFilterChange(): void {
    this.selectedSubCategoryId = null; // on vide la sous-catégorie sélectionnée
    this.subCategories = []; // on vide la liste des sous-catégories
    this.currentPage = 1; // on revient à la première page

    if (this.selectedCategoryId) {
      // si une catégorie est choisie, charger ses sous-catégories
      this.categoriesServices.getSubCategoriesByCategoryId(this.selectedCategoryId).subscribe(data => {
        this.subCategories = data.subCategories;
      });
    }
  }

  // Quand on change la sous-catégorie ou le prix
  onFilterChange(): void {
    this.currentPage = 1; // revenir à la page 1 pour voir les nouveaux résultats
  }

  // Filtre les transactions selon ce qui est choisi
  get filteredTransactions(): Transaction[] {
    return this.transactions.filter(t => {
      // 1. Filtre par catégorie (si rien de choisi, on garde tout)
      const matchCategory = this.selectedCategoryId
        ? t.category_transaction_id == this.selectedCategoryId
        : true;

      // 2. Filtre par sous-catégorie (si rien de choisi, on garde tout)
      const matchSubCategory = this.selectedSubCategoryId
        ? t.subcategory_transaction_id == this.selectedSubCategoryId
        : true;

      // 3. Filtre par prix (entre min et max)
      const matchPrice = t.montant_operation >= this.filterMinPrice &&
        t.montant_operation <= this.filterMaxPrice;

      // La transaction passe si toutes les conditions sont vraies
      return matchCategory && matchSubCategory && matchPrice;
    });
  }

  // --- Méthodes essentielles (raccourcies) ---

  // Charge toutes les transactions depuis le serveur
  loadTransactions() {
    this.transactionService.getAllTransactions().subscribe(data => {
      // On trie par date, de la plus récente à la plus ancienne
      this.transactions = data.transactions.sort((a, b) => new Date(b.date_operation).getTime() - new Date(a.date_operation).getTime());
      if (this.transactions.length > 0) {
        // On calcule le min et le max des montants pour régler le filtre
        const amounts = this.transactions.map(t => t.montant_operation);
        this.globalMinAmount = Math.min(...amounts);
        this.globalMaxAmount = Math.max(...amounts);
        // si l'utilisateur n'a pas changé le max par défaut, on initialise les valeurs du filtre
        if(this.filterMaxPrice === 10000) { this.filterMinPrice = this.globalMinAmount; this.filterMaxPrice = this.globalMaxAmount; }
      }
      // On ajoute les noms de catégories et sous-catégories aux transactions
      this.enrichTransactionsWithCategoryNames();
    });
  }

  // Supprime une transaction (avec confirmation)
  deleteTransaction(t: Transaction) {
    // demande à l'utilisateur si c'est ok, puis supprime et recharge la liste
    if(confirm('Supprimer ?')) this.transactionService.deleteTransaction(t.id).subscribe(() => this.loadTransactions());
  }

  // Ouvre la fenêtre d'édition et prépare le formulaire
  openEditModal(t: Transaction) {
    this.editingTransactionId = t.id;
    this.onEditCategoryChange(t.category_transaction_id); // charge les sous-catégories pour l'édition
    const dateStr = new Date(t.date_operation).toISOString().split('T')[0]; // formate la date pour l'input
    this.editForm = { date_operation: dateStr, montant_operation: t.montant_operation, type_operation: t.type_operation, category_transaction_id: t.category_transaction_id, subcategory_transaction_id: t.subcategory_transaction_id };
    this.isEditModalOpen = true; // ouvrir la modale
  }

  // Ferme la fenêtre d'édition
  closeEditModal() { this.isEditModalOpen = false; this.editingTransactionId = null; }

  // Sauvegarde l'édition sur le serveur, puis recharge la liste
  saveEdit() {
    if (this.editingTransactionId) this.transactionService.updateTransaction(this.editingTransactionId, this.editForm).subscribe(() => {
      this.closeEditModal();
      this.loadTransactions();
    });
  }

  // Quand on change la catégorie dans le formulaire d'édition
  onEditCategoryChange(catId: number) {
    this.editForm.category_transaction_id = catId;
    if (catId) {
      // charger les sous-catégories pour la catégorie choisie
      this.categoriesServices.getSubCategoriesByCategoryId(catId).subscribe(data => { this.subCategoriesForEdit = data.subCategories; });
    } else {
      this.subCategoriesForEdit = []; // rien choisi => liste vide
    }
  }

  // --- Pagination simple ---
  get totalPages(): number { return Math.ceil(this.filteredTransactions.length / this.itemsPerPage) || 1; }
  get paginatedTransactions(): Transaction[] { const startIndex = (this.currentPage - 1) * this.itemsPerPage; return this.filteredTransactions.slice(startIndex, startIndex + this.itemsPerPage); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  previousPage(): void { this.goToPage(this.currentPage - 1); }

  // Ajoute les noms de catégorie et sous-catégorie aux transactions pour l'affichage
  enrichTransactionsWithCategoryNames() {
    if (this.transactions.length === 0) return;
    // On prépare des requêtes pour ne pas demander plusieurs fois la même chose
    const categoryRequests: { [key: number]: Observable<Category> } = {};
    const subCategoryRequests: { [key: string]: Observable<SubCategory> } = {};
    this.transactions.forEach(t => {
      if (t.category_transaction_id && !categoryRequests[t.category_transaction_id]) categoryRequests[t.category_transaction_id] = this.categoriesServices.getCategoryById(t.category_transaction_id);
      if (t.category_transaction_id && t.subcategory_transaction_id) {
        const key = `${t.category_transaction_id}-${t.subcategory_transaction_id}`;
        if (!subCategoryRequests[key]) subCategoryRequests[key] = this.categoriesServices.getSubCategoryById(t.subcategory_transaction_id, t.category_transaction_id);
      }
    });
    const allRequests = { ...categoryRequests, ...subCategoryRequests };
    if (Object.keys(allRequests).length > 0) {
      // On attend toutes les réponses puis on ajoute les noms aux transactions
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
