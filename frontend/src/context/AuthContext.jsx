import {

    createContext,

    useContext,

    useEffect,

    useState

} from "react";

import {

    loginUser,

    registerUser,

    logoutUser,

    saveAuth,

    getCurrentUser,

    isAuthenticated

} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    // ======================================================
    // Restore Login
    // ======================================================

    useEffect(() => {

        if (isAuthenticated()) {

            const currentUser = getCurrentUser();

            if (currentUser) {

                setUser(currentUser);

            }

        }

        setLoading(false);

    }, []);

    // ======================================================
    // Login
    // ======================================================

    const login = async (loginData) => {

        const response = await loginUser(loginData);

        if (response.success) {

            saveAuth(

                response.token,

                response.user

            );

            setUser(response.user);

        }

        return response;

    };

    // ======================================================
    // Register
    // ======================================================

    const register = async (userData) => {

        return await registerUser(userData);

    };

    // ======================================================
    // Logout
    // ======================================================

    const logout = () => {

        logoutUser();

        setUser(null);

    };

    return (

        <AuthContext.Provider

            value={{

                user,

                loading,

                login,

                register,

                logout,

                isAuthenticated: !!user

            }}

        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => {

    return useContext(AuthContext);

};