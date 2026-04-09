import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeControlComponent } from './administrative-control.component';

describe('AdministrativeControlComponent', () => {
  let component: AdministrativeControlComponent;
  let fixture: ComponentFixture<AdministrativeControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativeControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
