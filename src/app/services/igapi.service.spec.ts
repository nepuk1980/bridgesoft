import { TestBed } from '@angular/core/testing';

import { IgapiService } from './igapi.service';

describe('IgapiService', () => {
  let service: IgapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IgapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
