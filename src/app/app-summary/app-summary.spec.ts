import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSummary } from './app-summary';

describe('AppSummary', () => {
  let component: AppSummary;
  let fixture: ComponentFixture<AppSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
