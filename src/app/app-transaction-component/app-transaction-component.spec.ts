import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTransactionComponent } from './app-transaction-component';

describe('AppTransactionComponent', () => {
  let component: AppTransactionComponent;
  let fixture: ComponentFixture<AppTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTransactionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
