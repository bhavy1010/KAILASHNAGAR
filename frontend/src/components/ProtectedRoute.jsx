import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {

    const {

        user,

        loading,

        isAuthenticated

    } = useAuth();

    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (

            <div className="flex items-center justify-center h-screen">

                <h1 className="text-xl font-semibold">

                    Loading...

                </h1>

            </div>

        );

    }

    // ======================================================
    // Not Logged In
    // ======================================================

    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;

    }

    // ======================================================
    // Logged In
    // ======================================================

    return children;

};

export default ProtectedRoute;