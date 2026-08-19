export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIResult = {
  text: string;
  model: string;
};

export interface AIProvider {
  generate(messages: AIMessage[]): Promise<AIResult>;
}

/**
 * Provider boundary.
 * Replace this with OpenAI/Anthropic/Gemini/local-model adapters later.
 */
export class MockAIProvider implements AIProvider {
  async generate(messages: AIMessage[]): Promise<AIResult> {
    const last = messages.at(-1)?.content ?? "";
    return {
      model: process.env.AI_MODEL ?? "foundation",
      text:
        `Foundation response received.\\n\\n` +
        `Request: ${last}\\n\\n` +
        `Next orchestration step: inspect the project, create a plan, ` +
        `request required tools, execute in a sandbox, validate, then present changes.`
    };
  }
}

export function createAIProvider(): AIProvider {
  return new MockAIProvider();
}
