export type DeploymentRequest = {
  projectId: string;
  environment: "preview" | "staging" | "production";
  artifact: string;
};

export interface DeploymentProvider {
  deploy(request: DeploymentRequest): Promise<{
    deploymentId: string;
    status: "queued" | "deployed";
    url?: string;
  }>;
}

/**
 * Adapter boundary for Vercel, Cloudflare, Kubernetes, AWS, etc.
 * Real deployment providers should be added one at a time behind this interface.
 */
export class MockDeploymentProvider implements DeploymentProvider {
  async deploy(request: DeploymentRequest) {
    return {
      deploymentId: `dep_${Date.now()}`,
      status: "queued" as const,
      url: undefined
    };
  }
}
