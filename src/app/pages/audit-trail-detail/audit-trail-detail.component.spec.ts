import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTrailDetailComponent } from './audit-trail-detail.component';

describe('AuditTrailDetailComponent', () => {
  let component: AuditTrailDetailComponent;
  let fixture: ComponentFixture<AuditTrailDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTrailDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditTrailDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
