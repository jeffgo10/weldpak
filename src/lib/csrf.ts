import { NextRequest } from 'next/server';
import csrf from 'csrf';

// Initialize CSRF token generator
const tokens = new csrf();

// Secret key for CSRF tokens (should be stored in environment variables)
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-key-change-in-production';

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return tokens.create(CSRF_SECRET);
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string): boolean {
  return tokens.verify(CSRF_SECRET, token);
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFToken(request: NextRequest): string | null {
  // Check X-CSRF-Token header first
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // Check X-XSRF-TOKEN header (common alternative)
  const xsrfToken = request.headers.get('X-XSRF-TOKEN');
  if (xsrfToken) {
    return xsrfToken;
  }

  // For POST requests, check the request body
  // Note: This would require parsing the body, which we'll handle in the route handlers
  return null;
}

/**
 * Middleware function to validate CSRF tokens
 */
export function validateCSRFToken(request: NextRequest, token?: string): { valid: boolean; error?: string } {
  const csrfToken = token || getCSRFToken(request);
  
  if (!csrfToken) {
    return { 
      valid: false, 
      error: 'CSRF token is required. Please include X-CSRF-Token header.' 
    };
  }

  if (!verifyCSRFToken(csrfToken)) {
    return { 
      valid: false, 
      error: 'Invalid CSRF token.' 
    };
  }

  return { valid: true };
}

/**
 * Check if the request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}
