import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaleDisabledAccountsReportComponent } from './stale-disabled-accounts-report.component';

describe('StaleDisabledAccountsReportComponent', () => {
  let component: StaleDisabledAccountsReportComponent;
  let fixture: ComponentFixture<StaleDisabledAccountsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaleDisabledAccountsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaleDisabledAccountsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
