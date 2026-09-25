import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceeditdpopupComponent } from './resourceeditdpopup.component';

describe('ResourceeditdpopupComponent', () => {
  let component: ResourceeditdpopupComponent;
  let fixture: ComponentFixture<ResourceeditdpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceeditdpopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceeditdpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
