import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSharePermissionsComponent } from './file-share-permissions.component';

describe('FileSharePermissionsComponent', () => {
  let component: FileSharePermissionsComponent;
  let fixture: ComponentFixture<FileSharePermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSharePermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSharePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
