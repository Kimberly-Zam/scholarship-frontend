import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfile } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private snackBar = inject(MatSnackBar);

  // Simulación de interacción con la IA (Gemini)
  // En una aplicación real, esto haría una petición HTTP al backend (NestJS)
  // que a su vez se comunicaría con la API de Gemini.
  sendToGemini(message: string, currentProfile: UserProfile): Observable<string> {
    console.log('Enviando a Gemini:', message, 'Perfil actual:', currentProfile);

    let aiResponse = '';
    let updatedProfile: Partial<UserProfile> = {};

    // Simulación de lógica de IA para completar el perfil
    if (message.toLowerCase().includes('edad')) {
      const ageMatch = message.match(/\b(edad|tengo)\s+(\d+)\s+(años?)\b/i);
      if (ageMatch && ageMatch[2]) {
        updatedProfile.age = parseInt(ageMatch[2], 10);
        aiResponse = `¡Excelente! He actualizado tu edad a ${updatedProfile.age} años. ¿Hay algo más que quieras agregar sobre tu educación o experiencia?`;
      } else {
        aiResponse = 'Por favor, dime tu edad con un número.';
      }
    } else if (message.toLowerCase().includes('educación') || message.toLowerCase().includes('estudios')) {
      const educationKeywords = ['bachiller', 'licenciatura', 'maestría', 'doctorado', 'grado'];
      const foundEducation = educationKeywords.find(keyword => message.toLowerCase().includes(keyword));
      if (foundEducation) {
        updatedProfile.education = foundEducation;
        aiResponse = `Entendido. He registrado tu nivel educativo como "${foundEducation}". ¿Qué idiomas hablas?`;
      } else {
        aiResponse = 'Por favor, sé más específico sobre tu nivel de educación (ej. Bachiller, Licenciatura, Maestría).';
      }
    } else if (message.toLowerCase().includes('idioma') || message.toLowerCase().includes('hablo')) {
      const languageMatch = message.match(/(español|inglés|francés|alemán|portugués)\s+(b1|b2|c1|c2|nativo)/i);
      if (languageMatch) {
        const lang = languageMatch[1];
        const level = languageMatch[2].toUpperCase();
        updatedProfile.languages = [...(currentProfile.languages || []), { language: lang, level: level }];
        aiResponse = `Perfecto, he añadido "${lang} (${level})" a tus idiomas. ¿Tienes experiencia laboral o profesional?`;
      } else {
        aiResponse = 'Por favor, dime el idioma y el nivel, por ejemplo: "Hablo inglés B2" o "Español nativo".';
      }
    } else if (message.toLowerCase().includes('experiencia') || message.toLowerCase().includes('trabajo')) {
      updatedProfile.experience = message; // En un caso real, la IA procesaría esto más inteligentemente
      aiResponse = 'Gracias por compartir tu experiencia. ¿Hay algún país en particular donde te gustaría estudiar o trabajar?';
    } else if (message.toLowerCase().includes('país de interés') || message.toLowerCase().includes('me gustaría ir a')) {
      const countryMatch = message.match(/(alemania|estados unidos|canadá|españa|chile|bolivia)/i);
      if (countryMatch) {
        updatedProfile.countryOfInterest = countryMatch[1];
        aiResponse = `¡Excelente elección! He registrado ${updatedProfile.countryOfInterest} como tu país de interés. Creo que ya tenemos suficiente información para empezar a buscar becas.`;
      } else {
        aiResponse = 'Por favor, dime un país de interés específico.';
      }
    } else {
      aiResponse = 'Hola, soy tu asistente de IA. Veo que tu perfil está incompleto. ¿Podrías decirme tu edad, tu nivel de educación o los idiomas que hablas?';
    }

    return of({ aiResponse, updatedProfile }).pipe(
      delay(1500), // Simula tiempo de procesamiento de IA
      tap(() => {
        this.snackBar.open('Respuesta de IA recibida', 'Cerrar', { duration: 1000 });
      })
    ).pipe(
      // Mapear solo la respuesta de texto para el componente
      // El componente AiChatComponent se encargará de actualizar el perfil
      // usando ProfileService.updateUserProfile()
      // Esto es solo un ejemplo de cómo la IA podría devolver la info para actualizar el perfil.
      // En un escenario real, el backend NestJS haría el parsing y update.
      (response) => {
        // En este ejemplo, el servicio de chat no actualiza el perfil directamente,
        // sino que le devuelve la información al componente para que lo haga.
        // Esto desacopla las responsabilidades.
        return of(aiResponse);
      }
    );
  }

  // --- Lógica de la API de Gemini (solo para referencia, sería en NestJS) ---
  /*
  async callGeminiApi(prompt: string): Promise<string> {
      // Este código se ejecutaría en el backend (NestJS)
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = "YOUR_GEMINI_API_KEY"; // Tu clave API de Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const result = await response.json();

          if (result.candidates && result.candidates.length > 0 &&
              result.candidates[0].content && result.candidates[0].content.parts &&
              result.candidates[0].content.parts.length > 0) {
              const text = result.candidates[0].content.parts[0].text;
              return text;
          } else {
              console.error("Unexpected Gemini API response structure:", result);
              return "Lo siento, no pude procesar tu solicitud en este momento.";
          }
      } catch (error) {
          console.error("Error calling Gemini API:", error);
          return "Hubo un error al comunicarse con la IA.";
      }
  }
  */
}
