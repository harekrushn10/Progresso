import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    // Retrieve token from cookies
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          // Token expired, clear user
          setUser(null);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setUser(null);
      }
    }
  }, []);

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    isSubAdmin: user?.role === 'SUB_ADMIN',
    isUser: user?.role === 'USER'
  };
};