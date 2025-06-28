import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  loginGoogle() {
    this.auth.loginWithGoogle().then(() => {
      console.log('Login Google exitoso');
    });
  }

  loginEmail() {
    this.auth.loginWithEmail(this.email, this.password).then(() => {
      console.log('Login con correo exitoso');
    }).catch(err => console.error('Error:', err));
  }

  registrar() {
    this.auth.registerWithEmail(this.email, this.password).then(() => {
      console.log('Usuario creado');
    });
  }
}
