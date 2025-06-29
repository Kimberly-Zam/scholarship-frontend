import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';

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
  standalone: true,
  templateUrl: './chat-cv-parser.component.html',
  styleUrls: ['./chat-cv-parser.component.scss'],
  imports: [ReactiveFormsModule, NgIf, NgClass, NgForOf],
})
export class ChatCvParserComponent {
  message = new FormControl('');
  chatHistory: { role: 'user' | 'assistant', content: string }[] = [];
  profile: UserProfile = {};

  constructor() {
    this.chatHistory.push({
      role: 'assistant',
      content:
        `👋 Hola. Puedes pegar tu CV como texto o subir un PDF.\n` +
        `Estoy recopilando:\n` +
        `- Nombre completo\n- Correo\n- Teléfono\n- Educación\n- Experiencia\n- Idiomas\n- Intereses\n- País deseado\n\n` +
        `Una vez que tenga toda la información, podrás buscar becas.`,
    });
  }

  async sendMessage(): Promise<void> {
    const userText = this.message.value?.trim();
    if (!userText) return;

    this.chatHistory.push({ role: 'user', content: userText });
    this.message.setValue('');

    const response = await this.queryOpenAI(this.chatHistory);
    const aiReply = response?.reply;
    const profileUpdate = response?.profile;

    if (aiReply) this.chatHistory.push({ role: 'assistant', content: aiReply });
    if (profileUpdate) this.mergeProfile(profileUpdate);
  }

  async handlePdfUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || file.type !== 'application/pdf') return;

    const formData = new FormData();
    formData.append('file', file);

    this.chatHistory.push({
      role: 'assistant',
      content: '📄 Procesando tu CV en PDF...',
    });

    try {
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const extracted: Partial<UserProfile> = await res.json();
      this.mergeProfile(extracted);

      this.chatHistory.push({
        role: 'assistant',
        content: '✅ He leído tu CV. Te preguntaré algunos datos que faltan en tu perfil.',
      });

      // Preguntar el siguiente campo faltante
      const next = this.nextFieldPrompt();
      if (next) this.chatHistory.push({ role: 'assistant', content: next });

    } catch (e) {
      this.chatHistory.push({
        role: 'assistant',
        content: '❌ Hubo un error al procesar el PDF.',
      });
    }
  }

  async queryOpenAI(messages: { role: 'user' | 'assistant', content: string }[]): Promise<{
    reply: string,
    profile?: Partial<UserProfile>
  }> {
    const OPENAI_API_KEY = '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'; // tu clave
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              `Eres un asistente que ayuda a completar este perfil:\n` +
              `fullName, email, phone, education, experience, languages, interests, desiredCountry.\n` +
              `Haz preguntas concisas para lo que falte. Si detectas datos nuevos, devuelve al final un bloque JSON bajo "profile".\n` +
              `Sé directo, breve y profesional.`,
          },
          ...messages,
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    let extractedProfile: Partial<UserProfile> | undefined;

    try {
      const match = content.match(/```json\n([\s\S]*?)\n```/);
      if (match) extractedProfile = JSON.parse(match[1]);
    } catch {}

    return { reply: content.replace(/```json[\s\S]*?```/, '').trim(), profile: extractedProfile };
  }

  mergeProfile(update: Partial<UserProfile>) {
    for (const key of Object.keys(update) as (keyof UserProfile)[]) {
      const newVal = update[key];
      if (
        newVal !== undefined &&
        (this.profile[key] === undefined || this.profile[key] === null || this.profile[key]?.length === 0)
      ) {
        // @ts-ignore
        this.profile[key] = newVal;
      }
    }
  }

  isProfileComplete(): boolean {
    return [
      'fullName', 'email', 'phone', 'education',
      'experience', 'languages', 'interests', 'desiredCountry'
    ].every(field => {
      // @ts-ignore
      const val = this.profile[field];
      return val !== undefined && val !== null && (!Array.isArray(val) || val.length > 0);
    });
  }

  nextFieldPrompt(): string | null {
    const fields: (keyof UserProfile)[] = [
      'fullName', 'email', 'phone', 'education',
      'experience', 'languages', 'interests', 'desiredCountry'
    ];
    for (const f of fields) {
      if (!this.profile[f]) {
        return `¿Podrías decirme tu ${this.fieldLabel(f)}?`;
      }
    }
    return null;
  }

  fieldLabel(f: keyof UserProfile): string {
    return {
      fullName: 'nombre completo',
      email: 'correo electrónico',
      phone: 'número de teléfono',
      education: 'nivel de educación',
      experience: 'experiencia laboral',
      languages: 'idiomas',
      interests: 'intereses',
      desiredCountry: 'país de destino'
    }[f];
  }

  buscarBecas() {
    this.chatHistory.push({
      role: 'assistant',
      content: '🔎 Genial. Ahora buscaré las becas ideales para tu perfil... (en desarrollo)',
    });
  }
}
