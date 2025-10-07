/**
 * API Service - Automatically switches between Next.js API routes and Firebase Functions
 * based on environment configuration
 */

interface ApiConfig {
  useFirebaseFunctions: boolean;
  firebaseFunctionsUrl: string;
  nextApiUrl: string;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      useFirebaseFunctions: process.env.NEXT_PUBLIC_USE_FIREBASE_FUNCTIONS === 'true',
      firebaseFunctionsUrl: process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || '',
      nextApiUrl: typeof window !== 'undefined' ? window.location.origin : '',
    };
  }

  /**
   * Get the appropriate API endpoint for file processing
   */
  private getProcessFilesEndpoint(): string {
    if (this.config.useFirebaseFunctions && this.config.firebaseFunctionsUrl) {
      return `${this.config.firebaseFunctionsUrl}/processFiles`;
    }
    return `${this.config.nextApiUrl}/api/process-files`;
  }

  /**
   * Get the appropriate API endpoint for health check
   */
  private getHealthEndpoint(): string {
    if (this.config.useFirebaseFunctions && this.config.firebaseFunctionsUrl) {
      return `${this.config.firebaseFunctionsUrl}/health`;
    }
    return `${this.config.nextApiUrl}/api/health`;
  }

  private getCSRFEndpoint(): string {
    if (this.config.useFirebaseFunctions && this.config.firebaseFunctionsUrl) {
      return `${this.config.firebaseFunctionsUrl}/csrf`;
    }
    return `${this.config.nextApiUrl}/api/csrf`;
  }

  /**
   * Get CSRF token from the API
   */
  private async getCSRFToken(): Promise<string> {
    try {
      const csrfUrl = this.getCSRFEndpoint();
      console.log('Fetching CSRF token from:', csrfUrl);
      
      const response = await fetch(csrfUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('CSRF token received:', data.csrfToken ? 'Present' : 'Missing');
      return data.csrfToken || '';
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return '';
    }
  }

  /**
   * Process files using the appropriate backend
   */
  async processFiles(files: unknown[], sessionId?: string, userLocation?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  }): Promise<unknown> {
    const endpoint = this.getProcessFilesEndpoint();
    
    console.log(`Using API endpoint: ${endpoint}`);
    console.log(`Firebase Functions enabled: ${this.config.useFirebaseFunctions}`);

    // CSRF protection disabled for now
    console.log('CSRF protection disabled');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // CSRF token headers disabled
    console.log('CSRF token headers disabled');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        files, 
        sessionId,
        userLocation 
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to process files: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<unknown> {
    const endpoint = this.getHealthEndpoint();
    
    const response = await fetch(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current configuration for debugging
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Check if Firebase Functions are enabled
   */
  isUsingFirebaseFunctions(): boolean {
    return this.config.useFirebaseFunctions;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
