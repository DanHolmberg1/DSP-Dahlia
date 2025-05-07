// contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface User {
  id: number;
   // här borde det egentligen var typ;
   //user_id: number:
   //sub: string;
   //token: string;
   // resten ska inte behövas här
  name: string;     
  email: string;    
  avatar: string;
  latitude?: number;
  longitude?: number;
  features?: string[]; // Assuming features is an array of strings
  pace?: string; // Assuming pace is a string (e.g., 'Low', 'Medium', 'High')
  bio?: string; // Assuming bio is a
  
}

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);