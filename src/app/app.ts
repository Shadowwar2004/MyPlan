import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AppTransactionComponent} from './app-transaction-component/app-transaction-component';
import {AppSummary} from './app-summary/app-summary';
import {AppNavbar} from './app-navbar/app-navbar';

@Component({
  selector: 'app-root',
  imports: [AppTransactionComponent, AppSummary, AppNavbar],
  templateUrl: './app.html',
  styleUrl: 'app.css'
})
export class App {
  protected readonly title = signal('MyPlan');

  activeView: 'summary' | 'add' = 'summary';

  setActiveView(view: 'summary' | 'add'): void {
    this.activeView = view;
  }

  onTransactionSaved(): void {
    // Retour au récapitulatif après sauvegarde
    this.setActiveView('summary');
  }
}
