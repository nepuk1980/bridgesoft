import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAccessComponent } from './review-access.component';

describe('ReviewAccessComponent', () => {
  let component: ReviewAccessComponent;
  let fixture: ComponentFixture<ReviewAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
