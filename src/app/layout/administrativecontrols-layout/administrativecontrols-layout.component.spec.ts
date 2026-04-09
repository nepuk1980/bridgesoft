import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativecontrolsLayoutComponent } from './administrativecontrols-layout.component';

describe('AdministrativecontrolsLayoutComponent', () => {
  let component: AdministrativecontrolsLayoutComponent;
  let fixture: ComponentFixture<AdministrativecontrolsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativecontrolsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativecontrolsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
