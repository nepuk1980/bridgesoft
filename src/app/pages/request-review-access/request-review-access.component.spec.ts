import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestReviewAccessComponent } from './request-review-access.component';

describe('RequestReviewAccessComponent', () => {
  let component: RequestReviewAccessComponent;
  let fixture: ComponentFixture<RequestReviewAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestReviewAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestReviewAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
