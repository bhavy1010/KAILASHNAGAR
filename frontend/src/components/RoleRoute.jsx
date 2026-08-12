import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ roles, children }) => {

    const {

        user,

        loading

    } = useAuth();

    // ======================================================
    // Wait Until Auth Loads
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
    // No User
    // ======================================================

    if (!user) {

        return <Navigate to="/login" replace />;

    }

    // ======================================================
    // Permission Check
    // ======================================================

    if (!roles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {

        // TEMPORARY DEBUG — remove once the redirect issue is resolved.
        // This pops up on screen automatically, no DevTools needed.
        alert(
            "RoleRoute BLOCKED\n" +
            "user.role = " + user.role + "\n" +
            "allowed roles = " + JSON.stringify(roles) + "\n" +
            "current path = " + window.location.pathname
        );

        return <Navigate to="/dashboard" replace />;

    }

    // ======================================================
    // Allowed
    // ======================================================

    return children;

};

export default RoleRoute;