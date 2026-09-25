import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestWorkflowComponent } from './request-workflow.component';

describe('RequestWorkflowComponent', () => {
  let component: RequestWorkflowComponent;
  let fixture: ComponentFixture<RequestWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
