import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import {Router} from '@angular/router';

interface UserProfile {
  id?: string;
  nombre_completo?: string;
  edad?: number | null;
  fecha_nacimiento?: string | null;
  email?: string;
  contacto?: string | null;
  ubicacion?: string;
  carrera?: string;
  experiencia_laboral?: { empresa: string; puesto: string; periodo: string }[];
  sexo?: 'Masculino' | 'Femenino' | 'Otro' | 'No especificado';
  estudios_postgrado?: { institucion: string; titulo: string }[];
  voluntariados?: { organizacion: string; rol: string }[];
  skills?: string[];
  idiomas?: { idioma: string; nivel: string }[];
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
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
  profile: UserProfile = {};
  profileCompleted: boolean = false;

  constructor(private router: Router) {
    this.chatHistory.push({
      role: 'assistant',
      content:
        `👋 Hola. Soy tu asistente para construir tu perfil académico y profesional.\n\n` +
        `Puedes comenzar pegando tu CV como texto, describiéndote en tus palabras, o adjuntando un archivo PDF.\n\n` +
        `📋 Estoy recopilando esta información:\n` +
        `- Nombre completo\n- Edad y fecha de nacimiento\n- Correo y teléfono\n- Ubicación actual\n- Carrera y postgrados\n` +
        `- Experiencia laboral y voluntariados\n- Idiomas y habilidades\n- Identidad de género\n\n` +
        `Cuando tenga todo, podrás buscar oportunidades que se ajusten a tu perfil. Empecemos cuando quieras.`,
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
    formData.append('cv', file);

    this.chatHistory.push({
      role: 'assistant',
      content: '📄 Procesando tu CV en PDF...',
    });

    try {
      const res = await fetch('http://localhost:3000/cv/extract', {
        method: 'POST',
        body: formData,
      });

      const body = await res.json();
      const extracted: Partial<UserProfile> = body?.data;

      if (extracted) {
        this.mergeProfile(extracted);
        this.chatHistory.push({
          role: 'assistant',
          content: '✅ He leído tu CV. Te preguntaré algunos datos que faltan en tu perfil.',
        });

        const next = this.nextFieldPrompt();
        if (next) this.chatHistory.push({ role: 'assistant', content: next });
      } else {
        this.chatHistory.push({
          role: 'assistant',
          content: '⚠️ El archivo fue recibido, pero no se extrajo información útil.',
        });
      }

      // Si quieres guardar el firebaseDocId:
      // this.firebaseDocId = body.firebaseDocId;

    } catch (e) {
      this.chatHistory.push({
        role: 'assistant',
        content: '❌ Hubo un error al procesar el PDF.',
      });
    }
  }


  async queryOpenAI(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<{
    reply: string;
    profile?: Partial<UserProfile>;
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
              `Eres un asistente que conversa con el usuario para llenar este perfil en formato JSON:\n\n` +
              `{\n` +
              `  "nombre_completo": string,\n` +
              `  "edad": number | null,\n` +
              `  "fecha_nacimiento": string | null,\n` +
              `  "email": string,\n` +
              `  "contacto": string | null,\n` +
              `  "ubicacion": string,\n` +
              `  "carrera": string,\n` +
              `  "experiencia_laboral": [{empresa: string, puesto: string, periodo: string}],\n` +
              `  "sexo": "Masculino" | "Femenino" | "Otro" | "No especificado",\n` +
              `  "estudios_postgrado": [{institucion: string, titulo: string}],\n` +
              `  "voluntariados": [{organizacion: string, rol: string}],\n` +
              `  "skills": string[],\n` +
              `  "idiomas": [{idioma: string, nivel: string}]\n` +
              `}\n\n` +
              `Haz preguntas claras, breves y naturales para obtener la información faltante. Si identificas nuevos datos, devuélvelos al final en un bloque JSON dentro de \`\`\`json ... \`\`\`.` +
              ` Si ya tienes información, puedes confirmarla o preguntar lo que falta.`,
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

    return {
      reply: content.replace(/```json[\s\S]*?```/, '').trim(),
      profile: extractedProfile,
    };
  }

  async mergeProfile(update: Partial<UserProfile>) {
    for (const key of Object.keys(update) as (keyof UserProfile)[]) {
      const newVal = update[key];
      if (
        newVal !== undefined &&
        (this.profile[key] === undefined || this.profile[key] === null || (Array.isArray(this.profile[key]) && (this.profile[key] as any[]).length === 0))
      ) {
        // @ts-ignore
        this.profile[key] = newVal;
      }
    }

    const formData = new FormData();
    formData.append('updateData', JSON.stringify(this.profile));

    this.chatHistory.push({
      role: 'assistant',
      content: '📄 Procesando la información proporcionada...',
    });

    await fetch(`http://localhost:3000/cv/${this.profile.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.profile),
    });

    this.profileCompleted = this.isProfileComplete();
  }


  isProfileComplete(): boolean {
    const required: (keyof UserProfile)[] = [
      'nombre_completo', 'edad', 'fecha_nacimiento', 'email', 'contacto',
      'ubicacion', 'carrera', 'experiencia_laboral', 'sexo',
      'estudios_postgrado', 'voluntariados', 'skills', 'idiomas'
    ];

    return required.every(key => {
      const val = this.profile[key];
      return val !== undefined && val !== null && (!Array.isArray(val) || val.length > 0);
    });
  }

  nextFieldPrompt(): string | null {
    const fields: (keyof UserProfile)[] = [
      'nombre_completo', 'edad', 'fecha_nacimiento', 'email', 'contacto',
      'ubicacion', 'carrera', 'experiencia_laboral', 'sexo',
      'estudios_postgrado', 'voluntariados', 'skills', 'idiomas'
    ];
    for (const f of fields) {
      if (!this.profile[f] || (Array.isArray(this.profile[f]) && this.profile[f]?.length === 0)) {
        return `¿Podrías decirme tu ${this.fieldLabel(f)}?`;
      }
    }
    return null;
  }

  fieldLabel(f: keyof UserProfile): string {
    return {
      id: '',
      nombre_completo: 'nombre completo',
      edad: 'edad',
      fecha_nacimiento: 'fecha de nacimiento',
      email: 'correo electrónico',
      contacto: 'número de contacto',
      ubicacion: 'ubicación',
      carrera: 'carrera profesional',
      experiencia_laboral: 'experiencia laboral',
      sexo: 'identidad de género',
      estudios_postgrado: 'estudios de postgrado',
      voluntariados: 'voluntariados',
      skills: 'habilidades',
      idiomas: 'idiomas'
    }[f] ?? f;
  }

  buscarBecas() {
    this.router.navigate(['becas']);
  }
}
