import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
// import { RegisterComponent } from './auth/register/register.component';
// import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
// import { ProfileFormComponent } from './profile/profile-form/profile-form.component';
// import { UserPanelComponent } from './profile/user-panel/user-panel.component';
// import { ScholarshipListComponent } from './scholarships/scholarship-list/scholarship-list.component';
// import { ScholarshipDetailComponent } from './scholarships/scholarship-detail/scholarship-detail.component';
// import { AiChatComponent } from './chat/ai-chat/ai-chat.component';
// import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
  // { path: 'forgot-password', component: ForgotPasswordComponent },
  // { path: 'profile', component: ProfileFormComponent, canActivate: [authGuard] },
  // { path: 'user-panel', component: UserPanelComponent, canActivate: [authGuard] },
  // { path: 'scholarships', component: ScholarshipListComponent, canActivate: [authGuard] },
  // { path: 'scholarships/:id', component: ScholarshipDetailComponent, canActivate: [authGuard] },
  // { path: 'ai-chat', component: AiChatComponent, canActivate: [authGuard] },
  // { path: '', redirectTo: '/scholarships', pathMatch: 'full' },
  // { path: '**', redirectTo: '/scholarships' }
];
