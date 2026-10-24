import {
  Investigation,
  InvestigationsResponse,
  InvestigatePayload,
  ApiErrorResponse,
} from '../types/investigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorMessage = `HTTP error ${res.status}: ${res.statusText}`;
      try {
        const errorData: ApiErrorResponse = await res.json();
        if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
        }
      } catch {
        // Response wasn't valid JSON, fallback to status text
      }
      throw new Error(errorMessage);
    }
    return (await res.json()) as T;
  }

  /**
   * Fetches all saved investigations with pagination
   */
  async getInvestigations(limit = 50, skip = 0): Promise<InvestigationsResponse> {
    const url = `${this.baseUrl}/ai/investigations?limit=${limit}&skip=${skip}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    return this.handleResponse<InvestigationsResponse>(res);
  }

  /**
   * Fetches a single saved investigation by ID
   */
  async getInvestigationById(id: string): Promise<Investigation> {
    const url = `${this.baseUrl}/ai/investigations/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    return this.handleResponse<Investigation>(res);
  }

  /**
   * Triggers a new AI investigation workflow and returns the persisted record
   */
  async runInvestigation(payload: InvestigatePayload): Promise<Investigation> {
    const url = `${this.baseUrl}/ai/investigate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<Investigation>(res);
  }

  /**
   * Deletes a saved investigation by ID
   */
  async deleteInvestigation(
    id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    const url = `${this.baseUrl}/ai/investigations/${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });
    return this.handleResponse<{ success: boolean; message: string; id: string }>(res);
  }

  /**
   * Fetches workflow runs for a repository to get total workflow count
   * Route: @Get('workflow-runs/:owner/:repo') on backend github controller
   */
  async getWorkflowRuns(
    owner: string,
    repo: string,
  ): Promise<{ total_count: number; workflow_runs: unknown[] }> {
    const url = `${this.baseUrl}/github/workflow-runs/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    return this.handleResponse<{ total_count: number; workflow_runs: unknown[] }>(res);
  }

  /**
   * Dispatches a workflow on GitHub Actions
   * Route: POST /repos/:owner/:repo/actions/workflows/:workflow_id/dispatches
   */
  async dispatchWorkflow(
    owner: string,
    repo: string,
    workflowId: string,
    ref: string = 'main',
  ): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ref }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(res);
  }
}

export const api = new ApiService(API_BASE_URL);
