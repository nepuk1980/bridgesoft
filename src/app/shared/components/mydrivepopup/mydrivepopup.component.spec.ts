import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MydrivepopupComponent } from './mydrivepopup.component';

describe('MydrivepopupComponent', () => {
  let component: MydrivepopupComponent;
  let fixture: ComponentFixture<MydrivepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MydrivepopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MydrivepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
