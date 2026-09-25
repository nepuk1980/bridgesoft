import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestaccessLayoutComponent } from './requestaccess-layout.component';

describe('RequestaccessLayoutComponent', () => {
  let component: RequestaccessLayoutComponent;
  let fixture: ComponentFixture<RequestaccessLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestaccessLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestaccessLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
