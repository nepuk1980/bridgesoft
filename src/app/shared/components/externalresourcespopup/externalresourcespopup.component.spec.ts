import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalresourcespopupComponent } from './externalresourcespopup.component';

describe('ExternalresourcespopupComponent', () => {
  let component: ExternalresourcespopupComponent;
  let fixture: ComponentFixture<ExternalresourcespopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalresourcespopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalresourcespopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
