import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilefoldersharepopupComponent } from './filefoldersharepopup.component';

describe('FilefoldersharepopupComponent', () => {
  let component: FilefoldersharepopupComponent;
  let fixture: ComponentFixture<FilefoldersharepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilefoldersharepopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilefoldersharepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
