export interface Scholarship {
  id: string;
  title: string;
  required_education_level: string;
  academic_fields: string[];
  required_languages: { language: string, level: string }[];
  destination_country: string;
  modality: string;
  duration: number; // in months
  benefits: string[];
  allowed_nationalities: string[];
  deadline: string; // YYYY-MM-DD
  additional_requirements: string[];
  scholarship_type: string; // e.g., "full", "partial"
  application_link: string;
  score: number;
  reasons: string[];
}
