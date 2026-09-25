import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAccessDetailComponent } from './review-access-detail.component';

describe('ReviewAccessDetailComponent', () => {
  let component: ReviewAccessDetailComponent;
  let fixture: ComponentFixture<ReviewAccessDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewAccessDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewAccessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
