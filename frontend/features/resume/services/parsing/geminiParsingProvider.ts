import { ResumeParsingProvider, ResumeStructuredData } from "../../types/parsing.types";

export class GeminiParsingProvider implements ResumeParsingProvider {
  readonly name = "Gemini";

  async parse(text: string): Promise<ResumeStructuredData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a professional resume parser. Parse the following plain text resume and extract it into a structured JSON object matching the schema below.
    
    CRITICAL Schema Rules:
    - You must match the schema keys and structure EXACTLY.
    - If a field is not present in the text, leave it as an empty string ("") or empty array ([]).
    - Do NOT omit any keys from the schema.
    - Do NOT include any markdown block markers (e.g. \`\`\`json) in your response. Return raw JSON text only.
    
    JSON Schema:
    {
      "personal": {
        "name": "",
        "email": "",
        "phone": "",
        "location": ""
      },
      "summary": "",
      "skills": [],
      "education": [
        {
          "institution": "",
          "degree": "",
          "field_of_study": "",
          "start_date": "",
          "end_date": ""
        }
      ],
      "experience": [
        {
          "company": "",
          "position": "",
          "location": "",
          "start_date": "",
          "end_date": "",
          "description": ""
        }
      ],
      "projects": [
        {
          "name": "",
          "description": "",
          "url": ""
        }
      ],
      "certifications": [],
      "achievements": [],
      "languages": [],
      "links": {
        "github": "",
        "linkedin": "",
        "portfolio": ""
      }
    }
    
    Resume Text:
    ${text}`;

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
