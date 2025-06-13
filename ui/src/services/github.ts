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
  
  async updateConfigFile(path: string, content: any): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('GitHub service is not configured');
    }

    try {
      // First, get the current file to get its SHA and content
      let sha = '';
      let currentContent = null;
      try {
        const fileResponse = await axios.get(
          `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${this.token}`
            }
          }
        );
        sha = fileResponse.data.sha;
        
        // Decode the content from base64
        if (fileResponse.data.content) {
          const decoded = atob(fileResponse.data.content.replace(/\n/g, ''));
          try {
            currentContent = JSON.parse(decoded);
          } catch (e) {
            // Not valid JSON, treat as different
          }
        }
      } catch (error) {
        // File doesn't exist yet, that's OK
      }
      
      // Check if content is the same to avoid unnecessary commits
      if (currentContent) {
        const currentJson = JSON.stringify(currentContent);
        const newJson = JSON.stringify(content);
        
        if (currentJson === newJson) {
          console.log('Config file content unchanged, skipping commit');
          return true; // No need to update
        }
      }

      // Convert content to base64
      const contentStr = JSON.stringify(content, null, 2);
      const contentBase64 = this.toBase64(contentStr);

      // Now update or create the file
      const response = await axios.put(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          message: 'Update booking configuration',
          content: contentBase64,
          sha: sha || undefined
        },
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Error updating config file:', error);
      return false;
    }
  }

  // Helper method for base64 encoding that works in browsers
  private toBase64(str: string): string {
    try {
      return btoa(str);
    } catch (e) {
      // For non-ASCII characters
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));
    }
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