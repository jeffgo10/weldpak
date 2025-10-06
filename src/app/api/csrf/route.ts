import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  try {
    // Generate a new CSRF token
    const token = generateCSRFToken();
    
    // Return the token in the response
    return NextResponse.json({ 
      csrfToken: token,
      message: 'CSRF token generated successfully'
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
