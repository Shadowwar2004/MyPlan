import {Component, OnInit} from '@angular/core';
import {Transaction, TransactionService} from '../../service/transaction';
import {CurrencyPipe, DatePipe,CommonModule} from '@angular/common';

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

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.transactionService.getAllTransactions().subscribe(data => {
      this.transactions = data.transactions;
      console.log("hello", this.transactions);
    });
  }
}
