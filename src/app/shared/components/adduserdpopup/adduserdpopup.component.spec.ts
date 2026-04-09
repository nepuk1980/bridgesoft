import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdduserdpopupComponent } from './adduserdpopup.component';

describe('AdduserdpopupComponent', () => {
  let component: AdduserdpopupComponent;
  let fixture: ComponentFixture<AdduserdpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdduserdpopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdduserdpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
