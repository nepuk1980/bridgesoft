import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesLayoutComponent } from './rules-layout.component';

describe('RulesLayoutComponent', () => {
  let component: RulesLayoutComponent;
  let fixture: ComponentFixture<RulesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
