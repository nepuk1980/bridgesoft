import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveAuditReportComponent } from './executive-audit-report.component';

describe('ExecutiveAuditReportComponent', () => {
  let component: ExecutiveAuditReportComponent;
  let fixture: ComponentFixture<ExecutiveAuditReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveAuditReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutiveAuditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
