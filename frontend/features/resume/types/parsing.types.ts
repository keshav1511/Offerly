export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  url: string;
}

export interface ResumeLinks {
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface ResumeMetadata {
  pageCount: number;
  wordCount: number;
}

export interface ResumeStructuredData {
  personal: PersonalInfo;
  summary: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  links: ResumeLinks;
  metadata: ResumeMetadata;
}

export interface ResumeParsingProvider {
  name: string;
  parse(text: string): Promise<ResumeStructuredData>;
}
