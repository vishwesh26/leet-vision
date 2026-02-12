import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({
    user: null,
    loading: false,
    error: null,
    login: async () => ({ success: false }),
    signup: async () => ({ success: false }),
    logout: async () => { },
    refreshUser: async () => { }
});

export const useAuth = () => useContext(AuthContext) || {
    user: null,
    loading: false,
    error: null,
    login: async () => ({ success: false }),
    signup: async () => ({ success: false }),
    logout: async () => { },
    refreshUser: async () => { }
};

// Use VITE_API_URL or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/auth/me`, {
                withCredentials: true
            });

            if (response.data.status === 'success') {
                setUser(response.data.data.user);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const refreshUser = async () => {
        await checkLoginStatus();
    };

    // Sign Up
    const signup = async (name, email, password, otp) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE}/api/auth/signup`,
                { name, email, password, otp },
                { withCredentials: true }
            );

            if (response.data.status === 'success') {
                setUser(response.data.data.user);
                return { success: true };
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to sign up';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );

            if (response.data.status === 'success') {
                setUser(response.data.data.user);
                return { success: true };
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Invalid email or password';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await axios.get(`${API_BASE}/api/auth/logout`, {
                withCredentials: true
            });
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Send OTP
    const sendOtp = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE}/api/auth/send-otp`, { email });
            if (response.data.status === 'success') {
                return { success: true };
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send verification code';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        sendOtp,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
