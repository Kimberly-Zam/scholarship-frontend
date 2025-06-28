import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { UserProfile } from '../../shared/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

// Firebase imports (descomentar si se usa Firebase real)
// import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
// import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  // private firestore = inject(Firestore); // Descomentar si se usa Firebase Firestore
  // private storage = inject(Storage); // Descomentar si se usa Firebase Storage

  constructor() { // Constructor vacío, inyección por `inject()`
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      // Simulación: Cargar perfil desde localStorage si existe
      const storedProfile = localStorage.getItem(`userProfile_${userId}`);
      if (storedProfile) {
        this.userProfileSubject.next(JSON.parse(storedProfile));
      } else {
        // En una app real, aquí harías la llamada a Firestore para obtener el perfil
        // const docRef = doc(this.firestore, `users/${userId}/profile`);
        // getDoc(docRef).then(docSnap => {
        //   if (docSnap.exists()) {
        //     this.userProfileSubject.next(docSnap.data() as UserProfile);
        //   }
        // });
        // Simulación: Si no hay perfil, crear uno básico
        this.userProfileSubject.next({ id: userId, name: 'Usuario Nuevo', email: 'user@example.com' });
      }
    }
  }

  updateUserProfile(profile: UserProfile): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.snackBar.open('Error: Usuario no autenticado', 'Cerrar', { duration: 3000 });
      return of(null);
    }

    // Simulación: Guardar en localStorage y actualizar BehaviorSubject
    return of(profile).pipe(
      delay(1000), // Simula latencia
      tap(updatedProfile => {
        localStorage.setItem(`userProfile_${userId}`, JSON.stringify(updatedProfile));
        this.userProfileSubject.next(updatedProfile);
        this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });

        // En una app real, aquí usarías Firestore para guardar el perfil
        // const docRef = doc(this.firestore, `users/${userId}/profile`);
        // setDoc(docRef, updatedProfile, { merge: true })
        //   .then(() => {
        //     this.userProfileSubject.next(updatedProfile);
        //     this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', { duration: 3000 });
        //   })
        //   .catch(error => {
        //     console.error("Error updating profile: ", error);
        //     this.snackBar.open('Error al actualizar el perfil', 'Cerrar', { duration: 3000 });
        //   });
      })
    );
  }

  uploadCV(file: File): Observable<string | null> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.snackBar.open('Error: Usuario no autenticado para subir CV', 'Cerrar', { duration: 3000 });
      return of(null);
    }

    // Simulación de subida de CV (reemplazar con Firebase Storage)
    return of('https://example.com/mock-cv-url.pdf').pipe(
      delay(2000), // Simula tiempo de subida
      tap(downloadURL => {
        if (downloadURL) {
          const currentProfile = this.userProfileSubject.getValue();
          if (currentProfile) {
            currentProfile.cvUrl = downloadURL;
            this.updateUserProfile(currentProfile); // Actualiza el perfil con la URL del CV
            this.snackBar.open('CV subido exitosamente', 'Cerrar', { duration: 3000 });
          }
        }
      })
    );

    // Lógica real para Firebase Storage:
    // const filePath = `cvs/${userId}/${file.name}`;
    // const storageRef = ref(this.storage, filePath);
    // const uploadTask = uploadBytesResumable(storageRef, file);

    // return new Observable<string | null>(observer => {
    //   uploadTask.on('state_changed',
    //     (snapshot) => {
    //       // Opcional: mostrar progreso
    //       const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //       console.log('Upload is ' + progress + '% done');
    //     },
    //     (error) => {
    //       console.error("Error uploading CV:", error);
    //       this.snackBar.open('Error al subir el CV', 'Cerrar', { duration: 3000 });
    //       observer.next(null);
    //       observer.complete();
    //     },
    //     () => {
    //       getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
    //         const currentProfile = this.userProfileSubject.getValue();
    //         if (currentProfile) {
    //           currentProfile.cvUrl = downloadURL;
    //           this.updateUserProfile(currentProfile); // Actualiza el perfil con la URL del CV
    //         }
    //         this.snackBar.open('CV subido exitosamente', 'Cerrar', { duration: 3000 });
    //         observer.next(downloadURL);
    //         observer.complete();
    //       });
    //     }
    //   );
    // });
  }

  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }
}
