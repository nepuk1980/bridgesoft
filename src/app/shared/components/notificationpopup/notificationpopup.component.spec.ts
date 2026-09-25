import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationpopupComponent } from './notificationpopup.component';

describe('NotificationpopupComponent', () => {
  let component: NotificationpopupComponent;
  let fixture: ComponentFixture<NotificationpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationpopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
