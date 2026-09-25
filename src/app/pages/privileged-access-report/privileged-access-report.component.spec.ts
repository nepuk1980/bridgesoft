import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegedAccessReportComponent } from './privileged-access-report.component';

describe('PrivilegedAccessReportComponent', () => {
  let component: PrivilegedAccessReportComponent;
  let fixture: ComponentFixture<PrivilegedAccessReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivilegedAccessReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivilegedAccessReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
