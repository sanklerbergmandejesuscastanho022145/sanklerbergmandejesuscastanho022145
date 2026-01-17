import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const { username, password } = this.loginForm.value;

  this.authService.login(username!, password!).subscribe({
    next: () => {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/pets';
      this.router.navigate([returnUrl]);
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = 'Login ou senha inválidos. Tente novamente.';
      console.error('Erro no login:', error);
    },
    complete: () => {
      this.loading = false;
    }
  });
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
