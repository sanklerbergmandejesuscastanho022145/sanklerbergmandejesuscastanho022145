import '../../test-setup';

// src/app/guards/auth-guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: typeof AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = AuthGuard;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});