export interface AgentToolSettings {
  search: boolean;
  knowledge: boolean;
  community: boolean;
  system: boolean;
}

export interface AgentRequestPayload {
  query: string;
  vision?: string;
  enabledTools: AgentToolSettings;
}

export type AgentSourceType = "search" | "knowledge" | "community" | "system";

export interface AgentSource {
  id: string;
  type: AgentSourceType;
  title: string;
  url?: string;
  snippet: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface AgentDiagnostics {
  steps: string[];
  toolTrace: string[];
  visionBias?: string[];
  errors?: string[];
}

export interface AgentResponse {
  query: string;
  vision?: string;
  timestamp: string;
  summary: string;
  plan: string[];
  sources: AgentSource[];
  diagnostics: AgentDiagnostics;
}
