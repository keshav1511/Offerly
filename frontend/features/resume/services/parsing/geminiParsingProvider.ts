import { ResumeParsingProvider, ResumeStructuredData } from "../../types/parsing.types";

export class GeminiParsingProvider implements ResumeParsingProvider {
  readonly name = "Gemini";

  async parse(text: string): Promise<ResumeStructuredData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert AI resume parser. Your task is to extract structured information from the plain text resume provided.

CRITICAL Extraction Guidelines:
1. Accuracy: Parse the details with high precision. Do not miss any education history, employment history, projects, certifications, languages, or web links (GitHub, LinkedIn, Portfolio).
2. Factual Integrity: Extract only what is present in the text. Do not invent details.
3. No Placeholders: Do not write placeholder text. If a section or field is not found in the resume, set it to an empty string ("") or an empty array ([]).
4. Schema Conformance: You must output a valid JSON object matching the schema keys and structures exactly. Do not wrap the output in markdown block indicators (such as \`\`\`json). Return raw JSON only.

JSON Schema:
{
  "personal": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, State / Location"
  },
  "summary": "Professional Summary",
  "skills": ["Skill 1", "Skill 2"],
  "education": [
    {
      "institution": "University / College Name",
      "degree": "Degree (e.g. B.S., M.S.)",
      "field_of_study": "Major / Field",
      "start_date": "Start Date",
      "end_date": "End Date"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "location": "Job Location",
      "start_date": "Start Date",
      "end_date": "End Date",
      "description": "Responsibilities and achievements bullet points"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project details description",
      "url": "Project URL"
    }
  ],
  "certifications": ["Certification Name"],
  "achievements": ["Achievement description"],
  "languages": ["Language Name"],
  "volunteer": [
    {
      "company": "Organization Name",
      "position": "Volunteer Role",
      "location": "Location",
      "start_date": "Start Date",
      "end_date": "End Date",
      "description": "Volunteer duties and accomplishments"
    }
  ],
  "leadership": [
    {
      "company": "Organization/Group Name",
      "position": "Leadership Title",
      "location": "Location",
      "start_date": "Start Date",
      "end_date": "End Date",
      "description": "Leadership responsibilities and achievements"
    }
  ],
  "links": {
    "github": "GitHub profile URL",
    "linkedin": "LinkedIn profile URL",
    "portfolio": "Portfolio or Personal Website URL",
    "leetcode": "LeetCode profile URL",
    "codeforces": "Codeforces profile URL",
    "kaggle": "Kaggle profile URL",
    "behance": "Behance portfolio URL",
    "dribbble": "Dribbble profile URL"
  }
}

Resume Text:
${text}
`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const parsedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedText) {
      throw new Error("Empty response from Gemini API.");
    }

    try {
      const parsedObj = JSON.parse(parsedText);
      return parsedObj as ResumeStructuredData;
    } catch {
      throw new Error(`Failed to parse JSON response from Gemini.`);
    }
  }
}
export const geminiParsingProvider = new GeminiParsingProvider();
