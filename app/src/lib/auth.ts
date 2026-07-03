export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Operator' | 'Reviewer';
  organization: string;
  workspace: string;
};

export async function login(email: string, password: string, workspace: string, role: 'Owner' | 'Operator' | 'Reviewer'): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, workspace, role }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { token: data.access_token, user: data.user };
    }
    return null;
  } catch {
    return null;
  }
}

export async function signup(email: string, password: string, name: string, organization: string): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, organization }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { token: data.access_token, user: data.user };
    }
    return null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getCurrentUser() !== null;
}
