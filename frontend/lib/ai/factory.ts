import { BaseLLMProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { ClaudeProvider } from "./providers/claude";

/**
 * Factory class for instantiating AI provider adapters dynamically.
 */
export class LLMProviderFactory {
  /**
   * Instantiates an adapter by name
   */
  static createProvider(providerName: "Gemini" | "Claude", apiKey?: string): BaseLLMProvider {
    switch (providerName) {
      case "Gemini":
        return new GeminiProvider(apiKey);
      case "Claude":
        return new ClaudeProvider(apiKey);
      default:
        throw new Error(`Unsupported AI Provider: ${providerName}`);
    }
  }
}
