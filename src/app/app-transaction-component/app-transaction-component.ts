import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Transaction, Category} from '../models/transaction.model';
import {TransactionService} from '../services/transaction-services';


@Component({
  selector: 'app-transaction-form',
  templateUrl: './app-transaction-component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./app-transaction-component.css']
})
export class AppTransactionComponent implements OnInit {
  transactionForm: FormGroup;
  categories: Category[] = [];
  subcategories: string[] = [];
  selectedType: 'income' | 'expense' = 'expense';
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.transactionForm = this.createForm();
  }

  ngOnInit(): void {
    this.transactionService.getCategories().subscribe({
      next: (categories) => {
        console.log("Categories loaded: ",categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des catégories: ", error);
      }
    });
    //this.updateCategoriesByType();
  }

  createForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['expense', Validators.required],
      category: ['', Validators.required],
      subcategory: ['', Validators.required],
      description: ['']
    });
  }

  /* onTypeChange(): void {
     this.selectedType = this.transactionForm.get('type')?.value;
     this.updateCategoriesByType();
     this.resetCategoryAndSubcategory();
   }/*

   /*onCategoryChange(): void {
     const selectedCategory = this.transactionForm.get('category')?.value;
     if (selectedCategory) {
       this.subcategories = this.transactionService.getSubcategories(selectedCategory);
       this.transactionForm.get('subcategory')?.enable();
     } else {
       this.subcategories = [];
       this.transactionForm.get('subcategory')?.disable();
     }
     this.transactionForm.patchValue({ subcategory: '' });
   }

   updateCategoriesByType(): void {
     const allCategories = this.transactionService.getCategories();
     if (this.selectedType === 'income') {
       this.categories = allCategories.filter(cat =>
         ['Salaire', 'Investissement'].includes(cat.name)
       );
     } else {
       this.categories = allCategories.filter(cat =>
         !['Salaire', 'Investissement'].includes(cat.name)
       );
     }
   }*/

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
      const formValue = this.transactionForm.value;
      const transaction: Transaction = {
        date: new Date(formValue.date),
        amount: parseFloat(formValue.amount),
        type: formValue.type,
        category: formValue.category,
        subcategory: formValue.subcategory,
        description: formValue.description
      };

      console.log('Transaction créée:', transaction);

      // Afficher le message de succès
      this.showSuccessMessage = true;

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        this.resetForm();
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  resetForm(): void {
    this.transactionForm.reset({
      date: new Date().toISOString().substring(0, 10),
      type: 'expense',
      category: '',
      subcategory: '',
      description: ''
    });
    this.selectedType = 'expense';
    //this.updateCategoriesByType();
    this.subcategories = [];
    this.transactionForm.get('subcategory')?.disable();
  }
}
