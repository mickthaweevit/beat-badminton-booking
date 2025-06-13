import axios from 'axios';

export class GitHubService {
  private token: string | null = null;
  private owner: string = '';
  private repo: string = '';

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    this.token = localStorage.getItem('github_token');
    const repository = localStorage.getItem('github_repo');
    
    if (repository) {
      const parts = repository.split('/');
      if (parts.length === 2) {
        this.owner = parts[0];
        this.repo = parts[1];
      }
    }
  }

  isConfigured(): boolean {
    return !!this.token && !!this.owner && !!this.repo;
  }

  async triggerWorkflow(bookingTime: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('GitHub service is not configured');
    }

    try {
      const response = await axios.post(
        `https://api.github.com/repos/${this.owner}/${this.repo}/dispatches`,
        {
          event_type: 'booking-trigger',
          client_payload: {
            booking_time: bookingTime
          }
        },
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.status === 204;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return false;
    }
  }

  async getWorkflowRuns(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('GitHub service is not configured');
    }

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}/actions/runs`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`
          },
          params: {
            per_page: 10
          }
        }
      );
      
      return response.data.workflow_runs || [];
    } catch (error) {
      console.error('Error getting workflow runs:', error);
      return [];
    }
  }
}

export default new GitHubService();