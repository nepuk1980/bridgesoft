import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityVaultDetailComponent } from './identity-vault-detail.component';

describe('IdentityVaultDetailComponent', () => {
  let component: IdentityVaultDetailComponent;
  let fixture: ComponentFixture<IdentityVaultDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityVaultDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityVaultDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
