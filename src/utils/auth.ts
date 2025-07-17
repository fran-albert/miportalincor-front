import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}

// Utility functions for secure token management
export const AuthUtils = {
  // Set token in sessionStorage (more secure than localStorage)
  setAuthToken: (token: string): void => {
    // Use sessionStorage instead of localStorage for better security
    // TODO: Implement httpOnly cookie with backend for maximum security
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp) {
      const expirationTime = decodedToken.exp * 1000;
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("tokenExpiration", expirationTime.toString());
    }
  },

  // Get token with expiration validation
  getAuthToken: (): string | null => {
    const token = sessionStorage.getItem("authToken");
    const expiration = sessionStorage.getItem("tokenExpiration");
    
    if (!token || !expiration) {
      return null;
    }

    const currentTime = Date.now();
    const expirationTime = parseInt(expiration, 10);

    if (currentTime >= expirationTime) {
      // Token expired, clean up
      AuthUtils.removeAuthToken();
      return null;
    }

    return token;
  },

  // Remove token and clean up
  removeAuthToken: (): void => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("tokenExpiration");
  },

  // Check if token is valid and not expired
  isTokenValid: (): boolean => {
    const token = AuthUtils.getAuthToken();
    return token !== null;
  },

  // Get token expiration time
  getTokenExpiration: (): number | null => {
    const expiration = sessionStorage.getItem("tokenExpiration");
    return expiration ? parseInt(expiration, 10) : null;
  }
};