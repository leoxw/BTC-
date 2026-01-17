const API_BASE_URL = 'http://localhost:3001/api';

const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('admin_token');
};

export const login = async (u: string, p: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: u, password: p })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setToken(data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const changePassword = async (newPass: string): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword: newPass })
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();
    return response.ok && data.valid;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
  }
};

export const setSession = (active: boolean) => {
    if(active) localStorage.setItem('admin_session', 'true');
    else localStorage.removeItem('admin_session');
}