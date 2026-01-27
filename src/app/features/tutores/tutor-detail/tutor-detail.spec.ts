import '../../../../test-setup';

import { TestBed } from '@angular/core/testing';
import { TutorDetailComponent } from './tutor-detail';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PetDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '123' }) }
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TutorDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});