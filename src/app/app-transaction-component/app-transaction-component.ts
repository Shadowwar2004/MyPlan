import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Transaction, Category} from '../models/transaction.model';
import {TransactionService} from '../services/transaction-services';


@Component({
  selector: 'app-transaction-form',
  templateUrl: './app-transaction-component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./app-transaction-component.css',]
})
export class AppTransactionComponent implements OnInit {
  @Input() transaction?: Transaction;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  transactionForm: FormGroup;
  categories: Category[] = [];
  subcategories: string[] = [];
  selectedType: 'INCOME' | 'EXPENSE' = 'EXPENSE'; // Uniquement majuscules
  isEditMode = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.transactionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();

    if (this.transaction) {
      this.isEditMode = true;
      this.populateForm(this.transaction);
    }
  }

  loadCategories(): void {
    this.transactionService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (!this.isEditMode) {
          this.updateCategoriesByType();
        }
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des catégories';
        console.error('Error loading categories:', error);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['EXPENSE', Validators.required], // Déjà correct
      category: ['', Validators.required],
      subcategory: [{value: '', disabled: true}, Validators.required], // Désactivé par défaut
      description: ['']
    });
  }

  populateForm(transaction: Transaction): void {
    this.selectedType = transaction.type;
    this.transactionForm.patchValue({
      date: transaction.date.substring(0, 10),
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description || ''
    });
    this.onCategoryChange();
  }

  onTypeChange(): void {
    this.selectedType = this.transactionForm.get('type')?.value;
    this.updateCategoriesByType();
    this.resetCategoryAndSubcategory();
  }

  onCategoryChange(): void {
    const selectedCategoryName = this.transactionForm.get('category')?.value;
    console.log('Catégorie sélectionnée:', selectedCategoryName); // Debug

    if (selectedCategoryName) {
      const category = this.categories.find(cat => cat.name === selectedCategoryName);
      console.log('Catégorie trouvée:', category); // Debug

      if (category && category.id) {
        this.transactionService.getSubcategories(category.id).subscribe({
          next: (subcategories) => {
            console.log('Sous-catégories reçues:', subcategories); // Debug
            this.subcategories = subcategories;
            this.transactionForm.get('subcategory')?.enable();
          },
          error: (error) => {
            this.error = 'Erreur lors du chargement des sous-catégories';
            console.error('Error loading subcategories:', error);
            console.error('Erreur complète:', error); // Plus de détails
          }
        });
      } else {
        console.error('Catégorie non trouvée ou ID manquant');
      }
    } else {
      this.subcategories = [];
      this.transactionForm.get('subcategory')?.disable();
      this.transactionForm.patchValue({ subcategory: '' });
    }
  }

  updateCategoriesByType(): void {
    if (this.selectedType === 'INCOME') {
      this.categories = this.categories.filter(cat =>
        ['Salaire', 'Investissement'].includes(cat.name)
      );
    } else {
      this.categories = this.categories.filter(cat =>
        !['Salaire', 'Investissement'].includes(cat.name)
      );
    }
  }

  resetCategoryAndSubcategory(): void {
    this.transactionForm.patchValue({
      category: '',
      subcategory: ''
    });
    this.subcategories = [];
    this.transactionForm.get('subcategory')?.disable();
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formValue = this.transactionForm.value;
      const transactionData: Transaction = {
        date: formValue.date,
        amount: parseFloat(formValue.amount),
        type: formValue.type, // Déjà en majuscules
        category: formValue.category,
        subcategory: formValue.subcategory,
        description: formValue.description
      };

      const operation = this.isEditMode && this.transaction
        ? this.transactionService.updateTransaction(this.transaction.id!, transactionData)
        : this.transactionService.createTransaction(transactionData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.saved.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = this.isEditMode
            ? 'Erreur lors de la modification'
            : 'Erreur lors de la création';
          console.error('Error saving transaction:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
