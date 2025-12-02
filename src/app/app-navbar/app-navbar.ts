import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-app-navbar',
  imports: [],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.css',
})
export class AppNavbar {
  imagePath = 'MyPlan.png';
  @Output() viewChange = new EventEmitter<'summary' | 'add'>();

  setActiveView(view: 'summary' | 'add'): void {
    this.viewChange.emit(view);
  }
}
