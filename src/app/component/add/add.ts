import {Component, OnInit} from '@angular/core';
import {CategoriesService, Category, SubCategory} from '../../service/categorie';
import {NewTransactionDTO, TransactionService} from '../../service/transaction';
import {FormsModule, NgForm} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './add.html',
  styleUrl: './add.css',
})
export class AddComponent implements OnInit {
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  selectedCategoryId: number | null = null;

  constructor(
    private categoryService: CategoriesService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    // Charger toutes les catégories au démarrage
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data.categories;
    });
  }

  // Se déclenche quand l'utilisateur sélectionne une catégorie
  onCategoryChange(): void {
    // Réinitialise les sous-catégories
    this.subCategories = [];

    if (this.selectedCategoryId) {
      this.categoryService.getSubCategoriesByCategoryId(this.selectedCategoryId).subscribe(data => {
        this.subCategories = data.subCategories;
      });
    }
  }

  // Soumet le formulaire
  onSubmit(form: NgForm): void {
    if (form.valid) {
      const formValue = form.value;

      const transactionData: NewTransactionDTO = {
        date_operation: formValue.dateOperation,
        montant_operation: Math.round(formValue.montantOperation), // Convertit en long (centimes)
        type_operation: formValue.typeOperation,
        category_transaction_id: formValue.category_transaction_id,
        subcategory_transaction_id: formValue.subcategory_transaction_id
      };

      this.transactionService.createTransaction(transactionData).subscribe({
        next: (response) => {
          alert('Transaction ajoutée avec succès!');
          form.reset();
          this.subCategories = [];
          this.selectedCategoryId = null;
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la transaction', error);
          alert('Erreur lors de l\'ajout. Vérifiez la console.');
        }
      });
    }
  }
}
