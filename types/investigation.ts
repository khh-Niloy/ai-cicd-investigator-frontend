export type InvestigationStatus = 'success' | 'failure';

export interface FailedJob {
  jobId: string;
  jobName: string;
  rootCause: string;
  evidence: string;
  recommendedFix: string;
}

export interface Investigation {
  _id: string;
  owner: string;
  repo: string;
  runId: string;
  status: InvestigationStatus;
  summary: string;
  failedJobs: FailedJob[];
  createdAt: string;
  updatedAt: string;
  _persisted?: boolean;
  _persistenceError?: string;
}

export interface InvestigationsResponse {
  items: Investigation[];
  total: number;
  limit: number;
  skip: number;
}

export interface InvestigatePayload {
  owner: string;
  repo: string;
  run_id: string;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message: string | string[];
  error?: string;
}
