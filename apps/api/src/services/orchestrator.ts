import { createAIProvider } from "./ai.js";

export type OrchestrationPlan = {
  goal: string;
  steps: string[];
  requiresApproval: boolean;
};

export async function planAndRespond(prompt: string) {
  const provider = createAIProvider();

  const plan: OrchestrationPlan = {
    goal: prompt,
    steps: [
      "Understand request and constraints",
      "Inspect project context",
      "Create implementation plan",
      "Select tools and execution strategy",
      "Generate or modify code",
      "Run validation/tests in sandbox",
      "Prepare deployment",
      "Report result and artifacts"
    ],
    requiresApproval: true
  };

  const response = await provider.generate([
    {
      role: "system",
      content:
        "You are the planning layer of Master Oscar AI. " +
        "Do not execute code directly. Produce safe, auditable plans."
    },
    { role: "user", content: prompt }
  ]);

  return { plan, response };
}
