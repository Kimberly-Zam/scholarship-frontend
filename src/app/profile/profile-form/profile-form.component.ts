import {Component, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';


import {ProfileService} from '../../core/services/profile.service';
import {UserProfile} from '../../shared/models/user.model';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  profileForm: FormGroup;
  loading: boolean = false;
  cvFile: File | null = null;
  currentProfile: UserProfile | null = null;
  private profileSubscription: Subscription = new Subscription();

  educationLevels = ['High School Diploma', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
  languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];
  countries = ['Germany', 'USA', 'Spain', 'Canada', 'Bolivia', 'Colombia', 'Chile', 'Argentina', 'Mexico', 'Brazil'];

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{value: '', disabled: true}],
      age: ['', [Validators.min(1), Validators.max(99)]],
      education: [''],
      languages: this.fb.array([]),
      experience: [''],
      countryOfInterest: ['']
    });
  }

  ngOnInit(): void {
    this.profileSubscription = this.profileService.getUserProfile().subscribe(profile => {
      if (profile) {
        this.currentProfile = profile;
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          age: profile.age,
          education: profile.education,
          experience: profile.experience,
          countryOfInterest: profile.countryOfInterest
        });
        while (this.languages.length !== 0) {
          this.languages.removeAt(0);
        }
        this.setLanguages(profile.languages || []);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }

  get languages(): FormArray {
    return this.profileForm.get('languages') as FormArray;
  }

  setLanguages(languages: { language: string, level: string }[]): void {
    languages.forEach(lang => {
      this.languages.push(this.fb.group({
        language: [lang.language, Validators.required],
        level: [lang.level, Validators.required]
      }));
    });
  }

  addLanguage(): void {
    this.languages.push(this.fb.group({
      language: ['', Validators.required],
      level: ['', Validators.required]
    }));
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  onFileSelected(event: any): void {
    this.cvFile = event.target.files[0];
  }

  onSaveProfile(): void {
    if (this.profileForm.valid && this.currentProfile) {
      this.loading = true;
      const updatedProfile: UserProfile = {
        ...this.currentProfile, // Mantiene ID y CV URL existentes
        name: this.profileForm.get('name')?.value,
        age: this.profileForm.get('age')?.value,
        education: this.profileForm.get('education')?.value,
        languages: this.profileForm.get('languages')?.value,
        experience: this.profileForm.get('experience')?.value,
        countryOfInterest: this.profileForm.get('countryOfInterest')?.value
      };

      this.profileService.updateUserProfile(updatedProfile).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Perfil guardado exitosamente', 'Cerrar', {duration: 3000});

          // Verificar si el perfil está completo, si no, sugerir ir al chat
          const incompleteFields = this.checkIncompleteProfile(updatedProfile);
          if (incompleteFields.length > 0) {
            this.snackBar.open(`Tu perfil está incompleto: ${incompleteFields.join(', ')}. ¿Quieres completarlo con la IA?`, 'Ir a Chat', {duration: 8000})
              .onAction().subscribe(() => {
              this.router.navigate(['/ai-chat']);
            });
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al guardar el perfil:', err);
          this.snackBar.open('Error al guardar el perfil', 'Cerrar', {duration: 3000});
        }
      });
    }
  }

  onUploadCV(): void {
    if (this.cvFile) {
      this.loading = true;
      this.profileService.uploadCV(this.cvFile).subscribe({
        next: (url) => {
          this.loading = false;
          if (url) {
            this.snackBar.open('CV subido correctamente', 'Cerrar', {duration: 3000});
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al subir CV:', err);
          this.snackBar.open('Error al subir CV', 'Cerrar', {duration: 3000});
        }
      });
    } else {
      this.snackBar.open('Por favor, selecciona un archivo CV.', 'Cerrar', {duration: 3000});
    }
  }

  checkIncompleteProfile(profile: UserProfile): string[] {
    const incomplete: string[] = [];
    if (!profile.age) incomplete.push('Edad');
    if (!profile.education) incomplete.push('Educación');
    if (!profile.languages || profile.languages.length === 0) incomplete.push('Idiomas');
    if (!profile.experience) incomplete.push('Experiencia');
    if (!profile.countryOfInterest) incomplete.push('País de Interés');
    return incomplete;
  }
}
