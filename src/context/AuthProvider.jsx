import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, clearAccessToken, readAccessToken, saveAccessToken } from '../utils/api';
import PropTypes from 'prop-types';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const token = readAccessToken();

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    apiRequest('/auth/me')
      .then((account) => {
        if (active) setUser(account);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) clearAccessToken();
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearAccessToken();
      setUser(null);
      setError('Your session has expired. Please sign in again.');
    }
    window.addEventListener('ems:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ems:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    setError('');
    const session = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAccessToken(session.token);
    setUser(session.employee);
  }, []);

  const logout = useCallback((reason = '') => {
    clearAccessToken();
    setUser(null);
    setError(reason);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
  }), [user, loading, error, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
