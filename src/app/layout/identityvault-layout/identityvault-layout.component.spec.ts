import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityvaultLayoutComponent } from './identityvault-layout.component';

describe('IdentityvaultLayoutComponent', () => {
  let component: IdentityvaultLayoutComponent;
  let fixture: ComponentFixture<IdentityvaultLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityvaultLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityvaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
