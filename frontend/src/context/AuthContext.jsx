import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tienda: action.payload.tienda,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        tienda: null,
        token: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tienda: null,
        token: null,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'UPDATE_TIENDA':
      return {
        ...state,
        tienda: { ...state.tienda, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  tienda: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          tienda: response.data.tienda,
          token: localStorage.getItem('token')
        }
      });
    } catch (error) {
      logout();
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(credentials);
      
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al registrarse';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: response.data.user
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateTienda = (tiendaData) => {
    dispatch({
      type: 'UPDATE_TIENDA',
      payload: tiendaData
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateTienda,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};