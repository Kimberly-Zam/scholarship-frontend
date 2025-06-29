import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { identifier, password } = this.loginForm.value;

      this.auth.loginWithEmail(identifier, password)
        .then(() => {
          this.loading = false;
          this.router.navigate(['/scholarships']);
        })
        .catch(err => {
          this.loading = false;
          console.error('Error de login:', err);
          this.snackBar.open('Error al iniciar sesión. Verifica tus datos.', 'Cerrar', { duration: 3000 });
        });
    }
  }

  loginGoogle(): void {
    this.loading = true;
    this.auth.loginWithGoogle()
      .then(() => {
        this.loading = false;
        this.router.navigate(['/scholarships']);
      })
      .catch(err => {
        this.loading = false;
        console.error('Error con Google:', err);
        this.snackBar.open('Error con Google. Intenta de nuevo.', 'Cerrar', { duration: 3000 });
      });
  }

  registrar(): void {
    const { identifier, password } = this.loginForm.value;

    if (!identifier || !password) {
      this.snackBar.open('Completa los campos antes de registrarte.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.auth.registerWithEmail(identifier, password)
      .then(() => {
        this.snackBar.open('Cuenta creada con éxito.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/scholarships']);
      })
      .catch(err => {
        console.error('Error de registro:', err);
        this.snackBar.open('Error al registrar cuenta.', 'Cerrar', { duration: 3000 });
      });
  }
}
