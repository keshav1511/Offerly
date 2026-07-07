export interface ResumeStructuredData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    url: string;
  }>;
  certifications: string[];
  achievements: string[];
  languages: string[];
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
  metadata: {
    pageCount: number;
    wordCount: number;
  };
}

export interface ResumeParsingProvider {
  name: string;
  parse(text: string): Promise<ResumeStructuredData>;
}
