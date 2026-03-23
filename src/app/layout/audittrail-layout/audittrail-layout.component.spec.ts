import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudittrailLayoutComponent } from './audittrail-layout.component';

describe('AudittrailLayoutComponent', () => {
  let component: AudittrailLayoutComponent;
  let fixture: ComponentFixture<AudittrailLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudittrailLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudittrailLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
