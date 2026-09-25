import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedetailspopupComponent } from './employeedetailspopup.component';

describe('EmployeedetailspopupComponent', () => {
  let component: EmployeedetailspopupComponent;
  let fixture: ComponentFixture<EmployeedetailspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeedetailspopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeedetailspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
