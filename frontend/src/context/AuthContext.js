import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('vivaToken');
    const storedUser = localStorage.getItem('vivaUser');
    const storedRole = localStorage.getItem('vivaRole');

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken, userRole) => {
    localStorage.setItem('vivaToken', userToken);
    localStorage.setItem('vivaUser', JSON.stringify(userData));
    localStorage.setItem('vivaRole', userRole);
    
    setToken(userToken);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('vivaToken');
    localStorage.removeItem('vivaUser');
    localStorage.removeItem('vivaRole');
    
    setToken(null);
    setUser(null);
    setRole(null);
    
    navigate('/');
  };

  const isAuthenticated = !!token;

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
