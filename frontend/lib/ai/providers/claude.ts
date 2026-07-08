import { BaseLLMProvider } from "../types";

/**
 * Adapter class for Anthropic Claude API
 */
export class ClaudeProvider implements BaseLLMProvider {
  readonly name = "Claude";
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.CLAUDE_API_KEY;
    if (!key) {
      throw new Error("CLAUDE_API_KEY is not configured.");
    }
    this.apiKey = key;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const url = "https://api.anthropic.com/v1/messages";
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyPayload: any = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    };

    if (systemInstruction) {
      bodyPayload.system = systemInstruction;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Claude API.");
    }

    return text;
  }

  async generateEmbeddings(): Promise<number[]> {
    throw new Error("Claude does not support native text embeddings. Use GeminiProvider instead.");
  }

  async parseStructuredData<T>(text: string, schemaString: string): Promise<T> {
    const prompt = `Parse the following text and return a structured JSON object conforming to the schema below. Return only the JSON object. Do not explain your response.
    
    Schema:
    ${schemaString}
    
    Text to Parse:
    ${text}`;

    const systemInstruction = "You are a precise data extractor. You only respond with valid, structured JSON. Do not include markdown code block syntax (like ```json).";
    const result = await this.generateText(prompt, systemInstruction);
    
    // Clean up potential markdown formatting if model didn't obey system instruction perfectly
    let cleaned = result.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }
    
    return JSON.parse(cleaned) as T;
  }
}
