import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ProfileFormComponent} from './profile/profile-form/profile-form.component';
import {ChatCvParserComponent} from './pages/chat-cv-parser/chat-cv-parser.component';
import { ScholarshipsComponent } from './pages/scholarships/scholarships.component';

export const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'chat', component: ChatCvParserComponent},
  {path: 'profile', component: ProfileFormComponent},
  {path: 'becas', component: ScholarshipsComponent},

 ];
