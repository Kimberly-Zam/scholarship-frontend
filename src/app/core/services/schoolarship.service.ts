import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import {Scholarship} from '../../shared/models/schoolarship.model';

// Firebase imports (descomentar si se usa Firebase real)
// import { Firestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ScholarshipService {
  // Datos de becas simulados
  private mockScholarships: Scholarship[] = [
    {
      "id": "sch1",
      "title": "Women in STEM - Germany",
      "required_education_level": "Bachelor's Degree",
      "academic_fields": ["STEM", "Engineering"],
      "required_languages": [{ "language": "English", "level": "B2" }],
      "destination_country": "Germany",
      "modality": "presential",
      "duration": 24,
      "benefits": ["tuition", "living expenses", "flights"],
      "allowed_nationalities": ["Bolivian", "Colombian"],
      "deadline": "2025-09-01",
      "additional_requirements": ["motivation letter", "academic reference"],
      "scholarship_type": "full",
      "application_link": "https://example.com/apply/stem-germany",
      "score": 6,
      "reasons": [
        "Matches academic interest",
        "Nationality allowed",
        "Available for presential modality",
        "Meets language requirement",
        "Preferred destination country",
        "Preferred study modality"
      ]
    },
    {
      "id": "sch2",
      "title": "Master's Scholarship in AI - USA",
      "required_education_level": "Master's Degree",
      "academic_fields": ["Computer Science", "Artificial Intelligence"],
      "required_languages": [{ "language": "English", "level": "C1" }],
      "destination_country": "USA",
      "modality": "online",
      "duration": 18,
      "benefits": ["tuition", "research grant"],
      "allowed_nationalities": ["All"],
      "deadline": "2025-10-15",
      "additional_requirements": ["GRE scores", "research proposal"],
      "scholarship_type": "partial",
      "application_link": "https://example.com/apply/ai-usa",
      "score": 5,
      "reasons": [
        "Matches academic interest",
        "Meets language requirement",
        "Available for online modality"
      ]
    },
    {
      "id": "sch3",
      "title": "PhD in Renewable Energy - Spain",
      "required_education_level": "Master's Degree",
      "academic_fields": ["Environmental Science", "Renewable Energy"],
      "required_languages": [{ "language": "Spanish", "level": "B2" }, { "language": "English", "level": "B1" }],
      "destination_country": "Spain",
      "modality": "presential",
      "duration": 36,
      "benefits": ["tuition", "stipend", "conference travel"],
      "allowed_nationalities": ["Chilean", "Argentinian", "Spanish"],
      "deadline": "2025-11-30",
      "additional_requirements": ["PhD proposal", "publications"],
      "scholarship_type": "full",
      "application_link": "https://example.com/apply/renewable-spain",
      "score": 7,
      "reasons": [
        "Matches academic interest",
        "Meets language requirement",
        "Preferred destination country",
        "High score match"
      ]
    },
    {
      "id": "sch4",
      "title": "Bachelor in Business Administration - Canada",
      "required_education_level": "High School Diploma",
      "academic_fields": ["Business Administration", "Commerce"],
      "required_languages": [{ "language": "English", "level": "B2" }, { "language": "French", "level": "A2" }],
      "destination_country": "Canada",
      "modality": "presential",
      "duration": 48,
      "benefits": ["tuition", "housing allowance"],
      "allowed_nationalities": ["Brazilian", "Mexican"],
      "deadline": "2025-08-01",
      "additional_requirements": ["SOP", "SAT scores"],
      "scholarship_type": "partial",
      "application_link": "https://example.com/apply/business-canada",
      "score": 4,
      "reasons": [
        "Matches academic interest",
        "Nationality allowed"
      ]
    }
  ];

  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  // private firestore = inject(Firestore); // Descomentar si se usa Firebase Firestore

  getMatchedScholarships(): Observable<Scholarship[]> {
    // En una app real, esto haría una llamada al backend de NestJS
    // que a su vez usaría el perfil del usuario para filtrar y obtener becas de Gemini.
    // fetch('/api/scholarships/match', { method: 'POST', body: JSON.stringify(userProfile) })
    return of(this.mockScholarships).pipe(
      delay(1000), // Simula latencia de red
      tap(() => {
        this.snackBar.open('Becas cargadas', 'Cerrar', { duration: 1000 });
      })
    );
  }

  getScholarshipById(id: string): Observable<Scholarship | undefined> {
    return of(this.mockScholarships.find(s => s.id === id)).pipe(
      delay(500) // Simula latencia
    );
  }

  // saveScholarship(scholarshipId: string): Observable<void> {
  //   const userId = this.authService.getCurrentUserId();
  //   if (!userId) {
  //     this.snackBar.open('Necesitas iniciar sesión para guardar becas.', 'Cerrar', { duration: 3000 });
  //     return of(undefined);
  //   }
  //
  //   return this.profileService.userProfile$.pipe(
  //     tap(profile => {
  //       if (profile) {
  //         const updatedSavedScholarships = [...(profile.savedScholarships || []), scholarshipId];
  //         this.profileService.updateUserProfile({ ...profile, savedScholarships: updatedSavedScholarships });
  //         this.snackBar.open('Beca guardada exitosamente', 'Cerrar', { duration: 3000 });
  //
  //         // Lógica real para Firebase Firestore:
  //         // const userDocRef = doc(this.firestore, `users/${userId}/profile`);
  //         // updateDoc(userDocRef, {
  //         //   savedScholarships: arrayUnion(scholarshipId)
  //         // }).then(() => {
  //         //   this.snackBar.open('Beca guardada exitosamente', 'Cerrar', { duration: 3000 });
  //         // }).catch(error => {
  //         //   console.error("Error saving scholarship:", error);
  //         //   this.snackBar.open('Error al guardar la beca', 'Cerrar', { duration: 3000 });
  //         // });
  //       }
  //     })
  //   );
  // }

  // removeSavedScholarship(scholarshipId: string): Observable<void> {
  //   const userId = this.authService.getCurrentUserId();
  //   if (!userId) {
  //     this.snackBar.open('Necesitas iniciar sesión para eliminar becas guardadas.', 'Cerrar', { duration: 3000 });
  //     return of(undefined);
  //   }
  //
  //   return this.profileService.userProfile$.pipe(
  //     tap(profile => {
  //       if (profile) {
  //         const updatedSavedScholarships = (profile.savedScholarships || []).filter(id => id !== scholarshipId);
  //         this.profileService.updateUserProfile({ ...profile, savedScholarships: updatedSavedScholarships });
  //         this.snackBar.open('Beca eliminada de guardadas', 'Cerrar', { duration: 3000 });
  //
  //         // Lógica real para Firebase Firestore:
  //         // const userDocRef = doc(this.firestore, `users/${userId}/profile`);
  //         // updateDoc(userDocRef, {
  //         //   savedScholarships: arrayRemove(scholarshipId)
  //         // }).then(() => {
  //         //   this.snackBar.open('Beca eliminada de guardadas', 'Cerrar', { duration: 3000 });
  //         // }).catch(error => {
  //         //   console.error("Error removing saved scholarship:", error);
  //         //   this.snackBar.open('Error al eliminar la beca de guardadas', 'Cerrar', { duration: 3000 });
  //         // });
  //       }
  //     })
  //   );
  // }
}
