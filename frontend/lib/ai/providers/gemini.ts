import { BaseLLMProvider } from "../types";

/**
 * Adapter class for Google Gemini API
 */
export class GeminiProvider implements BaseLLMProvider {
  readonly name = "Gemini";
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    this.apiKey = key;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyPayload: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini API.");
    }

    return text;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Embedding API error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const embedding = data.embedding?.values;
    if (!embedding) {
      throw new Error("Empty embedding response from Gemini.");
    }

    return embedding as number[];
  }

  async parseStructuredData<T>(text: string, schemaString: string): Promise<T> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    
    const prompt = `Parse the following text and return a structured JSON object conforming to the schema below. Do NOT wrap the JSON in markdown code blocks. Return raw JSON text only.
    
    Schema:
    ${schemaString}
    
    Text to Parse:
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
      throw new Error(`Gemini parse error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const parsedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedText) {
      throw new Error("Empty parse response from Gemini API.");
    }

    return JSON.parse(parsedText) as T;
  }
}
