import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Category, Transaction} from '../models/transaction.model';
import {TransactionService} from '../services/transaction-services';
import {Router} from '@angular/router';
import {DatePipe, DecimalPipe} from '@angular/common';
import {AppTransactionComponent} from '../app-transaction-component/app-transaction-component';

@Component({
  selector: 'app-app-summary',
  imports: [
    DecimalPipe,
    DatePipe,
    AppTransactionComponent
  ],
  templateUrl: './app-summary.html',
  styleUrl: './app-summary.css',
})
export class AppSummary implements OnInit {
  @Output() navigateToAdd = new EventEmitter<void>();

  transactions: Transaction[] = [];
  categories: Category[] = [];
  balance: number = 0;
  selectedTransaction: Transaction | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.transactionService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadTransactionsAndBalance();
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des catégories';
        this.isLoading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTransactionsAndBalance(): void {
    // Charger les transactions
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des transactions';
        this.isLoading = false;
        console.error('Error loading transactions:', error);
      }
    });

    // Charger le solde
    this.transactionService.getBalance().subscribe({
      next: (balance) => {
        this.balance = balance;
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      }
    });
  }

  onNavigateToAdd(): void {
    this.navigateToAdd.emit();
  }

  editTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
  }

  deleteTransaction(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          this.error = 'Erreur lors de la suppression';
          console.error('Error deleting transaction:', error);
        }
      });
    }
  }

  onTransactionSaved(): void {
    this.selectedTransaction = null;
    this.loadData();
  }

  cancelEdit(): void {
    this.selectedTransaction = null;
  }

  retry(): void {
    this.loadData();
  }
}
