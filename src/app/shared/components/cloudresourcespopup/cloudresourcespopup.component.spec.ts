import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudresourcespopupComponent } from './cloudresourcespopup.component';

describe('CloudresourcespopupComponent', () => {
  let component: CloudresourcespopupComponent;
  let fixture: ComponentFixture<CloudresourcespopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudresourcespopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudresourcespopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
