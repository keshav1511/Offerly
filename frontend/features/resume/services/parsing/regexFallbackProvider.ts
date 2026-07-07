import { ResumeParsingProvider, ResumeStructuredData } from "../../types/parsing.types";

export class RegexFallbackProvider implements ResumeParsingProvider {
  readonly name = "RegexFallback";

  async parse(text: string): Promise<ResumeStructuredData> {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    // 1. Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : "";

    // 2. Extract phone
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : "";

    // 3. Extract links
    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/i;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
    const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|io|dev|me)/gi;

    const githubMatch = text.match(githubRegex);
    const linkedinMatch = text.match(linkedinRegex);
    
    let portfolio = "";
    const portfolioMatches = text.match(portfolioRegex);
    if (portfolioMatches) {
      for (const m of portfolioMatches) {
        if (!m.includes("github.com") && !m.includes("linkedin.com") && !m.includes("google.com")) {
          portfolio = m;
          break;
        }
      }
    }

    // 4. Extract name (usually first non-empty line)
    let name = "";
    if (lines.length > 0) {
      for (const line of lines.slice(0, 5)) {
        if (
          !line.includes("@") && 
          !line.includes("github.com") && 
          !line.includes("linkedin.com") && 
          !line.match(/\d{4,}/) && 
          line.length > 2 && 
          line.length < 50
        ) {
          name = line;
          break;
        }
      }
    }

    // 5. Extract skills from common tech terms
    const commonSkills = [
      "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "HTML", "CSS", "Tailwind",
      "Node.js", "Express", "NestJS", "FastAPI", "Python", "Django", "Flask", "Java", "Spring Boot",
      "C++", "C#", "Go", "Golang", "Rust", "Ruby", "Rails", "SQL", "PostgreSQL", "MySQL", "MongoDB",
      "Redis", "Git", "GitHub", "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure",
      "GraphQL", "REST API", "CI/CD", "AI", "Machine Learning"
    ];
    const skills: string[] = [];
    for (const skill of commonSkills) {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(text)) {
        skills.push(skill);
      }
    }

    // Word count calculation
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
      personal: {
        name,
        email,
        phone,
        location: ""
      },
      summary: lines.slice(0, 5).join(" ").substring(0, 200) + "...",
      skills,
      education: [
        {
          institution: "University / College",
          degree: "Degree",
          field_of_study: "Major",
          start_date: "",
          end_date: ""
        }
      ],
      experience: [
        {
          company: "Company Name",
          position: "Role Name",
          location: "",
          start_date: "",
          end_date: "",
          description: "Parsed experience content placeholder"
        }
      ],
      projects: [
        {
          name: "Project Details",
          description: "Resume project detail summary",
          url: ""
        }
      ],
      certifications: [],
      achievements: [],
      languages: [],
      links: {
        github: githubMatch ? `https://${githubMatch[0]}` : "",
        linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
        portfolio: portfolio ? (portfolio.startsWith("http") ? portfolio : `https://${portfolio}`) : ""
      },
      metadata: {
        pageCount: 1,
        wordCount
      }
    };
  }
}
export const regexFallbackProvider = new RegexFallbackProvider();
