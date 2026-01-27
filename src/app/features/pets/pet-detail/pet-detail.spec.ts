import '../../../../test-setup';

import { TestBed } from '@angular/core/testing';
import { PetDetailComponent } from './pet-detail';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PetDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: '123' }) }
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PetDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});