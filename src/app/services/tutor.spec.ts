// src/app/services/tutor.spec.ts
import { TestBed } from '@angular/core/testing';
import { TutorService } from './tutor.service';

describe('TutoresService', () => {
  let service: TutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});