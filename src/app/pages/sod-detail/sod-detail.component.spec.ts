import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SodDetailComponent } from './sod-detail.component';

describe('SodDetailComponent', () => {
  let component: SodDetailComponent;
  let fixture: ComponentFixture<SodDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SodDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SodDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
