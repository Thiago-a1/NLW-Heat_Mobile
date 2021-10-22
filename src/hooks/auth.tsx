import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSessions from 'expo-auth-session';
import { api } from '../services/api';

const CLIENT_ID = '';
const SCOPE = '';

interface User {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
}

interface AuthContextData {
  user: User | null;
  isSignIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthorizationResponse {
  params: {
    code?: string;
    error?: string;
  },
  type?: string;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({children}: AuthProviderProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  async function signIn() {
    try {
      setIsSignIn(true);

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
      const authSeessionResponse = await AuthSessions.startAsync({ authUrl }) as AuthorizationResponse;
      
      if(authSeessionResponse.type === 'success' && 
        authSeessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post('/authenticate', {code: authSeessionResponse.params.code});
        const { user, token } = authResponse.data as AuthResponse;

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        await AsyncStorage.setItem('@nlwheat:user' , JSON.stringify(user));
        await AsyncStorage.setItem('@nlwheat:token' , token);

        setUser(user);
    }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSignIn(false)
    }

  }

  async function signOut() {
    setUser(null)
    await AsyncStorage.removeItem('@nlwheat:user');
    await AsyncStorage.removeItem('@nlwheat:token');
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem('@nlwheat:user');
      const tokenStorage = await AsyncStorage.getItem('@nlwheat:token');

      if (userStorage && tokenStorage) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      }

      setIsSignIn(false);
    }

    loadUserStorageData();
  }, [])

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        isSignIn
      }}
    >
      {children}
    </AuthContext.Provider>
  )
};

function useAuth() {
  const context = useContext(AuthContext);

  return context;
};

export { AuthProvider, useAuth };