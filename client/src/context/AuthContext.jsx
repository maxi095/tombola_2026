import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { registerRequest, loginRequest, logoutRequest, verifyTokenRequest } from "../api/auth";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (userData) => {
        try {
            const res = await registerRequest(userData);
            setUser(res.data);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
            const data = error.response?.data;
            if (Array.isArray(data)) {
                return setErrors(data);
            }
            setErrors([data?.message || error.message || "Error al registrarse"]);
        }
    };

    const signin = async (userData) => {
        try {
            const res = await loginRequest(userData);
            setIsAuthenticated(true);
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch (error) {
            const data = error.response?.data;
            if (Array.isArray(data)) {
                return setErrors(data);
            }
            setErrors([data?.message || error.message || "Error al iniciar sesión"]);
        }
    };

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } catch {
            // Si el backend no responde, igual limpiamos sesión local
        } finally {
            Cookies.remove("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
        }
    }, []);

    const hasRole = (role) => {
        return user?.roles === role;
    };

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    useEffect(() => {
        async function checkLogin() {
            // La cookie 'token' es httpOnly: js-cookie no puede leerla,
            // por eso verificamos siempre contra /api/verify (axios envía la cookie automáticamente).
            try {
                const res = await verifyTokenRequest();

                if (!res.data) {
                    setIsAuthenticated(false);
                    setUser(null);
                    localStorage.removeItem("user");
                    setLoading(false);
                    return;
                }

                setIsAuthenticated(true);
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        }

        checkLogin();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                logout,
                loading,
                user,
                isAuthenticated,
                errors,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
