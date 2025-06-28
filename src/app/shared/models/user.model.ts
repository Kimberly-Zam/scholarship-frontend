export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  education?: string;
  languages?: { language: string, level: string }[];
  experience?: string;
  countryOfInterest?: string;
  cvUrl?: string; // URL del CV en Firebase Storage
  savedScholarships?: string[]; // IDs de becas guardadas
}
