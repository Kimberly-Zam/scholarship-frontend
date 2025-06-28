import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { environment } from './environments/environment';
import {routes} from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()), // ✅ Esto es lo que habilita `Auth`
    provideStorage(() => getStorage())
  ]
});
