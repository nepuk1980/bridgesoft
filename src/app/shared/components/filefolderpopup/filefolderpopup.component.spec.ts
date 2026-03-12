import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilefolderpopupComponent } from './filefolderpopup.component';

describe('FilefolderpopupComponent', () => {
  let component: FilefolderpopupComponent;
  let fixture: ComponentFixture<FilefolderpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilefolderpopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilefolderpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
