import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityVaultComponent } from './identity-vault.component';

describe('IdentityVaultComponent', () => {
  let component: IdentityVaultComponent;
  let fixture: ComponentFixture<IdentityVaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityVaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityVaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
