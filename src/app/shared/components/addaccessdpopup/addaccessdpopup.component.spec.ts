import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddaccessdpopupComponent } from './addaccessdpopup.component';

describe('AddaccessdpopupComponent', () => {
  let component: AddaccessdpopupComponent;
  let fixture: ComponentFixture<AddaccessdpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddaccessdpopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddaccessdpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
