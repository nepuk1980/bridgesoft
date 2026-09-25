import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAccessDetailComponent } from './request-access-detail.component';

describe('RequestAccessDetailComponent', () => {
  let component: RequestAccessDetailComponent;
  let fixture: ComponentFixture<RequestAccessDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestAccessDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestAccessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
