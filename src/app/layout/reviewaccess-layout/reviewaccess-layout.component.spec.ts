import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewaccessLayoutComponent } from './reviewaccess-layout.component';

describe('ReviewaccessLayoutComponent', () => {
  let component: ReviewaccessLayoutComponent;
  let fixture: ComponentFixture<ReviewaccessLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewaccessLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewaccessLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
