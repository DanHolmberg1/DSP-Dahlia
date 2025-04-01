import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { User, ServerPreferences } from '../types/types';

interface Preferences {
  show_men: number;
  show_women: number;
  show_other: number;
  min_age: number;
  max_age: number;
  interests?: number[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Förbättrad token-hantering
  const getToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);
  const refreshToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;
  
      // Skicka en förfrågan för att förnya token
      const response = await fetch('http://192.168.0.118:3000/api/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Token refresh failed');
  
      const { token: newToken } = await response.json();
      await AsyncStorage.setItem('token', newToken);
      return newToken;
    } catch (err) {
      console.error('Refresh token error:', err);
      await AsyncStorage.multiRemove(['user', 'token']);
      return null;
    }
  }, []);
  // Allmän fetch-funktion med autentisering
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log(`Making authenticated request to: ${url}`); // Debug log
  
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log(`Response status: ${response.status}`); // Debug log
  
      if (response.status === 401) {
        // Token är ogiltig - rensa lagrad data
        await AsyncStorage.multiRemove(['user', 'token']);
        throw new Error('Your session has expired. Please login again.');
      }
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
  
      return response;
    } catch (err) {
      console.error('Auth fetch error:', {
        url,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      throw err;
    }
  }, []);

  const updateOnlineStatus = useCallback(async (userId: number, isOnline: boolean) => {
    try {
      await authFetch(`http://192.168.0.118:3000/api/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ isOnline }),
      });
    } catch (err) {
      console.error('Status update error:', err);
      throw err;
    }
  }, [authFetch]);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [storedUser, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);

      if (!storedUser || !token) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      // Hämta användardata från servern
      const [prefsResponse, interestsResponse] = await Promise.all([
        authFetch(`http://192.168.0.118:3000/api/users/${parsedUser.id}/preferences`),
        authFetch(`http://192.168.0.118:3000/api/users/${parsedUser.id}/interests`),
      ]);

      const [preferences, interests] = await Promise.all([
        prefsResponse.json(),
        interestsResponse.json(),
      ]);

      const updatedUser = { 
        ...parsedUser,
        ...preferences,
        interests: interests || [],
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      await updateOnlineStatus(updatedUser.id, true);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Om token är ogiltig, rensa lagrad data
      if (err instanceof Error && err.message === 'Session expired. Please login again.') {
        await AsyncStorage.multiRemove(['user', 'token']);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, updateOnlineStatus]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`http://192.168.0.118:3000/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { user: userData, token } = await response.json();

      const completeUser: User = {
        ...userData,
        show_men: userData.show_men === 1,
        show_women: userData.show_women === 1,
        show_other: userData.show_other === 1,
        interests: userData.interests || [],
      };

      // Spara både användare och token
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(completeUser)),
        AsyncStorage.setItem('token', token),
      ]);

      setUser(completeUser);
      return completeUser;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.id) {
        await updateOnlineStatus(user.id, false).catch(() => {});
      }
      await AsyncStorage.multiRemove(['user', 'token']);
      setUser(null);
      router.replace('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  }, [user, updateOnlineStatus]);

  const updatePreferences = useCallback(async (serverPrefs: ServerPreferences) => {
    if (!user?.id) throw new Error('User not logged in');

    try {
      const response = await authFetch(
        `http://192.168.0.118:3000/api/users/${user.id}/preferences`,
        {
          method: 'PUT',
          body: JSON.stringify(serverPrefs),
        }
      );

      const updatedData = await response.json();

      const updatedUser = {
        ...user,
        show_men: Boolean(updatedData.show_men),
        show_women: Boolean(updatedData.show_women),
        show_other: Boolean(updatedData.show_other),
        min_age: updatedData.min_age,
        max_age: updatedData.max_age,
        interests: updatedData.interests || [],
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Update preferences error:', err);
      throw err;
    }
  }, [user, authFetch]);

  // Funktion för att hämta matchningar
  const fetchMatches = useCallback(async (radius: number) => {
    if (!user?.id) throw new Error('User not logged in');

    try {
      const response = await authFetch(
        `http://192.168.0.118:3000/api/users/matches?userId=${user.id}&radius=${radius}`
      );
      return await response.json();
    } catch (err) {
      console.error('Fetch matches error:', err);
      throw err;
    }
  }, [user, authFetch]);

  // Pinga servern regelbundet
  useEffect(() => {
    if (!user?.id) return;

    const pingInterval = setInterval(async () => {
      try {
        await updateOnlineStatus(user.id, true);
      } catch (err) {
        console.error('Ping failed:', err);
      }
    }, 5 * 60 * 1000); // Var 5:e minut

    return () => clearInterval(pingInterval);
  }, [user, updateOnlineStatus]);

  // Ladda användare vid mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    loadUser,
    updatePreferences,
    updateOnlineStatus,
    fetchMatches,
    getToken,
  };
}

export default function AuthProvider() {
  return null;
}