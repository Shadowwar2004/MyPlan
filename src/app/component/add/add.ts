// TypeScript
// Salut ! Voilà ton fichier avec des commentaires simples.
// Je n'ai rien changé dans le code, j'ai juste ajouté des explications faciles.

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
  // Ici on garde toutes les catégories pour le menu
  categories: Category[] = [];
  // Ici on garde les sous-catégories quand on choisit une catégorie
  subCategories: SubCategory[] = [];
  // La catégorie que la personne choisit (ou rien si vide)
  selectedCategoryId: number | null = null;

  // Le constructeur, il prépare les services pour parler au serveur
  constructor(
    private categoryService: CategoriesService,
    private transactionService: TransactionService
  ) { }

  // ngOnInit s'exécute quand le composant commence, on charge les catégories
  ngOnInit(): void {
    // On demande toutes les catégories au serveur et on les met ici
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data.categories;
    });
  }

  // Quand l'utilisateur change la catégorie dans le formulaire
  onCategoryChange(): void {
    // On vide d'abord les sous-catégories pour recommencer
    this.subCategories = [];

    // Si une catégorie est sélectionnée, on demande ses sous-catégories
    if (this.selectedCategoryId) {
      this.categoryService.getSubCategoriesByCategoryId(this.selectedCategoryId).subscribe(data => {
        this.subCategories = data.subCategories;
      });
    }
  }

  // Cette fonction est appelée quand on soumet le formulaire
  onSubmit(form: NgForm): void {
    // On vérifie que le formulaire est valide (rempli correctement)
    if (form.valid) {
      const formValue = form.value;

      // On prépare les données comme le serveur les aime
      const transactionData: NewTransactionDTO = {
        date_operation: formValue.dateOperation,
        montant_operation: Math.round(formValue.montantOperation), // Convertit en entier (arrondi)
        type_operation: formValue.typeOperation,
        category_transaction_id: formValue.category_transaction_id,
        subcategory_transaction_id: formValue.subcategory_transaction_id
      };

      // On envoie la nouvelle transaction au serveur
      this.transactionService.createTransaction(transactionData).subscribe({
        next: (response) => {
          // Si tout va bien, on dit à l'utilisateur que c'est fait
          alert('Transaction ajoutée avec succès!');
          // On remet le formulaire à zéro
          form.reset();
          // Et on vide les sous-catégories et la sélection pour recommencer propre
          this.subCategories = [];
          this.selectedCategoryId = null;
        },
        error: (error) => {
          // Si ça casse, on affiche une erreur dans la console et une alerte
          console.error('Erreur lors de l\'ajout de la transaction', error);
          alert('Erreur lors de l\'ajout. Vérifiez la console.');
        }
      });
    }
  }
}
