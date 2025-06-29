import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userData = new BehaviorSubject<User | null>(null);
  user$ = this.userData.asObservable();

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged(user => {
      this.userData.next(user);
      if (user) {
        // Si el usuario está autenticado, guarda el email en el localStorage
        localStorage.setItem('userEmail', user.email || '');
      } else {
        // Si no hay usuario, elimina el email del localStorage
        localStorage.removeItem('userEmail');
      }
    });
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider()).then((result) => {
      // Guarda el email en el localStorage después de login con Google
      localStorage.setItem('userEmail', result.user.email || '');
    });
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then((result) => {
      // Guarda el email en el localStorage después de login con correo/contraseña
      localStorage.setItem('userEmail', result.user.email || '');
    });
  }

  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then((result) => {
      // Guarda el email en el localStorage después de registro
      localStorage.setItem('userEmail', result.user.email || '');
    });
  }

  logout() {
    return signOut(this.auth).then(() => {
      // Elimina el email del localStorage cuando el usuario cierre sesión
      localStorage.removeItem('userEmail');
    });
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // Método adicional para obtener el email del localStorage
  getUserEmailFromLocalStorage(): string | null {
    return localStorage.getItem('userEmail');
  }
}
