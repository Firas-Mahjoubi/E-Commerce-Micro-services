import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest, AuthResponse } from '@core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData = this.loginForm.value as LoginRequest;

    this.authService.login(loginData).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login successful', response);
        this.router.navigate([this.returnUrl]);
      },
      error: (error: Error) => {
        console.error('Login error', error);
        this.errorMessage = error.message || 'Invalid username or password. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onGoogleLogin(): void {
    // Implement Google OAuth login
    console.log('Google login clicked');
    this.errorMessage = 'Google login coming soon!';
  }

  onFacebookLogin(): void {
    // Implement Facebook OAuth login
    console.log('Facebook login clicked');
    this.errorMessage = 'Facebook login coming soon!';
  }
}
