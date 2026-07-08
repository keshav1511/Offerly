/**
 * Base Interface for all LLM Providers (Gemini, Claude, etc.)
 */
export interface BaseLLMProvider {
  /**
   * Identifies the provider brand name
   */
  readonly name: string;

  /**
   * Generates a raw text completion response
   */
  generateText(prompt: string, systemInstruction?: string): Promise<string>;

  /**
   * Generates high-dimensional vector embeddings for search and semantic matching
   */
  generateEmbeddings(text: string): Promise<number[]>;

  /**
   * Parses unstructured text into a strongly-typed JSON schema format
   */
  parseStructuredData<T>(text: string, schemaString: string): Promise<T>;
}
