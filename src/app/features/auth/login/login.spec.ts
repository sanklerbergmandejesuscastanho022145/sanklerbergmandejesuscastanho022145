// src/app/features/auth/login/login.spec.ts
import '../../../../test-setup';
import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});