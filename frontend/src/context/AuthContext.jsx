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

    fetchCurrentUser

} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    // ======================================================
    // Restore Login
    // ======================================================

    useEffect(() => {

        const restoreSession = async () => {

            // Show the cached user immediately for a snappy UI...
            const cachedUser = getCurrentUser();

            if (cachedUser) {
                setUser(cachedUser);
            }

            // ...then confirm with the server, since the httpOnly
            // cookie (not localStorage) is the real source of truth.
            const verifiedUser = await fetchCurrentUser();

            if (verifiedUser) {

                setUser(verifiedUser);

                localStorage.setItem(
                    "user",
                    JSON.stringify(verifiedUser)
                );

            } else {

                setUser(null);
                localStorage.removeItem("user");

            }

            setLoading(false);

        };

        restoreSession();

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

    const logout = async () => {

        await logoutUser();

        setUser(null);

    };

    const refreshUser = async () => {
        const verifiedUser = await fetchCurrentUser();
        if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem("user", JSON.stringify(verifiedUser));
        }
        return verifiedUser;
    };

    return (

        <AuthContext.Provider

            value={{

                user,

                loading,

                login,

                register,

                logout,

                refreshUser,

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