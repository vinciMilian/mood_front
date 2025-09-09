import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../service/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from usersData table
  const fetchUserData = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('UserContext: Fetching user data with token:', token ? 'present' : 'missing');
      const response = await authAPI.getUser(token);
      console.log('UserContext: API response:', response);
      
      if (response.success && response.user?.userData) {
        console.log('UserContext: Setting userData:', response.user.userData);
        setUserData(response.user.userData);
        return response.user.userData;
      } else {
        console.log('UserContext: No userData in response:', response);
        setError('Failed to fetch user data');
        return null;
      }
    } catch (err) {
      console.error('UserContext: Error fetching user data:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };


  // Refresh user data
  const refreshUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return await fetchUserData(token);
    }
    return null;
  };

  // Get user display name with fallbacks
  const getUserDisplayName = () => {
    if (!userData) return 'Erro - Dados do usuário não encontrado';
    return userData.displayName || 'Erro - Nome não encontrado';
  };

  // Get user initial (first letter of display name)
  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Get formatted creation date
  const getUserCreatedAt = () => {
    if (!userData?.created_at) return 'Data não disponível';
    
    const date = new Date(userData.created_at);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Initialize user data when auth is ready
  useEffect(() => {
    const initializeUserData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('UserContext: Waiting for auth to load...');
        return;
      }

      const token = localStorage.getItem('accessToken');
      
      console.log('UserContext: Initializing user data...', { 
        authLoading, 
        user: !!user, 
        token: !!token 
      });
      
      if (user && token) {
        try {
          console.log('UserContext: User from auth:', user);
          
          // If we already have userData, use it
          if (user.userData) {
            console.log('UserContext: Using existing userData from auth:', user.userData);
            setUserData(user.userData);
            setLoading(false);
          } else {
            console.log('UserContext: No userData in auth user, fetching from server...');
            // Otherwise, fetch it
            await fetchUserData(token);
          }
        } catch (error) {
          console.error('UserContext: Error initializing user data:', error);
          setError('Error loading user data');
          setLoading(false);
        }
      } else {
        console.log('UserContext: No user or token found');
        setUserData(null);
        setLoading(false);
      }
    };

    initializeUserData();
  }, [user, authLoading]);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        if (newUser?.userData) {
          setUserData(newUser.userData);
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    userData,
    loading,
    error,
    fetchUserData,
    refreshUserData,
    getUserDisplayName,
    getUserInitial,
    getUserCreatedAt,
    setError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
