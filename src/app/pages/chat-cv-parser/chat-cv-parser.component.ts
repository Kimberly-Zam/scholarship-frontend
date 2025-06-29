import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgForOf } from '@angular/common';

interface UserProfile {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  education?: string | null;
  experience?: string | null;
  languages?: string[] | null;
  interests?: string | null;
  desiredCountry?: string | null;
}

@Component({
  selector: 'app-chat-cv-parser',
  templateUrl: './chat-cv-parser.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgForOf],
  styleUrls: ['./chat-cv-parser.component.scss']
})
export class ChatCvParserComponent {
  message = new FormControl('');
  chatHistory: { from: 'user' | 'ai', text: string }[] = [];
  profile: UserProfile = {};
  currentField: keyof UserProfile | null = null;
  hasAskedFirstQuestion = false;

  fieldsOrder: (keyof UserProfile)[] = [
    'fullName', 'email', 'phone', 'education',
    'experience', 'languages', 'interests', 'desiredCountry'
  ];

  showProfileCommands = ['perfil completo', 'mostrar perfil', 'ver perfil', 'perfil en json', 'perfil json'];

  async sendMessage(): Promise<void> {
    const userTextRaw = this.message.value?.trim() ?? '';
    if (!userTextRaw) return;

    const userTextLower = userTextRaw.toLowerCase();

    this.chatHistory.push({ from: 'user', text: userTextRaw });
    this.message.setValue('');

    if (this.showProfileCommands.some(cmd => userTextLower.includes(cmd))) {
      if (userTextLower.includes('json')) {
        this.chatHistory.push({
          from: 'ai',
          text: `Aquí tienes tu perfil en JSON:\n${JSON.stringify(this.profile, null, 2)}`
        });
      } else {
        this.chatHistory.push({
          from: 'ai',
          text: `Este es tu perfil actual:\n${this.getFormattedProfile()}`
        });
      }
      return;
    }

    if (!this.hasAskedFirstQuestion) {
      const extracted = await this.simulateAiExtraction(userTextRaw);
      this.mergeProfile(extracted);
      this.hasAskedFirstQuestion = true;
    } else if (this.currentField) {
      if (this.isNegativeResponse(userTextLower)) {
        this.profile[this.currentField] = null;
      } else {
        const normalized = this.normalizeInput(this.currentField, userTextRaw);
        this.profile[this.currentField] = normalized;
      }
      this.currentField = null;
    } else {
      const extracted = await this.simulateAiExtraction(userTextRaw);
      this.mergeProfile(extracted);
    }

    const next = this.nextMissingField();
    if (next) {
      this.currentField = next;
      this.chatHistory.push({
        from: 'ai',
        text: this.questionForField(next)
      });
    } else {
      this.chatHistory.push({
        from: 'ai',
        text: '¡Genial! Tu perfil está completo. ¿Quieres ver un resumen o buscar becas?'
      });
    }
  }

  isNegativeResponse(text: string): boolean {
    const negatives = ['no', 'ninguna', 'sin', 'ninguno', 'no tengo', 'no poseo', 'nada', 'no aplica'];
    return negatives.some(n => text.includes(n));
  }

  normalizeInput(field: keyof UserProfile, input: string): any {
    if (!input) return null;
    switch (field) {
      case 'languages':
        return input.split(',').map(s => s.trim()).filter(Boolean);
      case 'phone':
        const digits = input.replace(/\D/g, '');
        return digits.length >= 7 ? digits : null;
      default:
        return input.trim();
    }
  }

  nextMissingField(): keyof UserProfile | null {
    for (const f of this.fieldsOrder) {
      if (!(f in this.profile)) return f;
      if (this.profile[f] === null || this.profile[f] === undefined) return f;
    }
    return null;
  }

  questionForField(field: keyof UserProfile): string {
    const questions: Record<keyof UserProfile, string> = {
      fullName: '¿Cuál es tu nombre completo?',
      email: '¿Cuál es tu correo electrónico?',
      phone: '¿Cuál es tu número de teléfono?',
      education: '¿Cuál es tu nivel o área de educación?',
      experience: '¿Tienes experiencia laboral? Si no, puedes decir "ninguna".',
      languages: '¿Qué idiomas hablas y qué nivel tienes? Por favor sepáralos por comas.',
      interests: '¿Qué áreas de estudio o trabajo te interesan?',
      desiredCountry: '¿A qué país te gustaría aplicar para una beca?'
    };
    return questions[field];
  }

  getFormattedProfile(): string {
    if (Object.keys(this.profile).length === 0) return 'No has completado ningún dato todavía.';
    return this.fieldsOrder.map(field => {
      const value = this.profile[field];
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        return `${this.fieldLabel(field)}: No especificado`;
      }
      if (Array.isArray(value)) {
        return `${this.fieldLabel(field)}: ${value.join(', ')}`;
      }
      return `${this.fieldLabel(field)}: ${value}`;
    }).join('\n');
  }

  fieldLabel(field: keyof UserProfile): string {
    const labels: Record<keyof UserProfile, string> = {
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Número de teléfono',
      education: 'Educación',
      experience: 'Experiencia laboral',
      languages: 'Idiomas',
      interests: 'Intereses',
      desiredCountry: 'País deseado'
    };
    return labels[field];
  }

  async simulateAiExtraction(text: string): Promise<Partial<UserProfile>> {
    const lower = text.toLowerCase();
    const profile: Partial<UserProfile> = {};

    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) profile.email = emailMatch[0];

    const nombreMatch = lower.match(/mi nombre es ([a-záéíóúüñ\s]+)/);
    if (nombreMatch) profile.fullName = nombreMatch[1].trim();

    if (lower.includes('ingeniería')) profile.education = 'Ingeniería';
    else if (lower.includes('licenciatura')) profile.education = 'Licenciatura';
    else if (lower.includes('maestría')) profile.education = 'Maestría';

    if (lower.includes('sin experiencia') || lower.includes('ninguna experiencia')) profile.experience = null;
    else if (lower.includes('experiencia')) profile.experience = 'Tiene experiencia';

    const langMatch = lower.match(/hablo ([a-záéíóúüñ,\s]+)/);
    if (langMatch) {
      profile.languages = langMatch[1].split(',').map(l => l.trim());
    }

    if (lower.includes('inteligencia artificial')) profile.interests = 'Inteligencia Artificial';

    if (lower.includes('alemania')) profile.desiredCountry = 'Alemania';
    else if (lower.includes('estados unidos')) profile.desiredCountry = 'Estados Unidos';

    return profile;
  }

  mergeProfile(extracted: Partial<UserProfile>) {
    for (const key of Object.keys(extracted) as (keyof UserProfile)[]) {
      if (
        (this.profile[key] === undefined || this.profile[key] === null || this.profile[key]?.length === 0)
        && extracted[key] !== undefined
      ) {
        // @ts-ignore
        this.profile[key] = extracted[key];
      }
    }
  }
}
