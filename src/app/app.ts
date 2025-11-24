import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AppTransactionComponent} from './app-transaction-component/app-transaction-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppTransactionComponent],
  templateUrl: './app.html',
  styleUrl: 'app.css'
})
export class App {
  protected readonly title = signal('MyPlan');
}
