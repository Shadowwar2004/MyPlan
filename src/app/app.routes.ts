import { Routes } from '@angular/router';
import {AddComponent} from './component/add/add';
import {Summary} from './component/summary/summary';

export const routes: Routes = [
  { path: 'summary', component: Summary },
  { path: 'add', component: AddComponent },
  { path: '', redirectTo: 'summary', pathMatch: 'full' },
  { path: '**', redirectTo: 'summary' }
];
