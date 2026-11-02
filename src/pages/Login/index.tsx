import { Navigate } from "react-router-dom";

import LoginFeature from "../../components/features/Login";
import { useAuth } from "../../context/auth";

function Login() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    return <LoginFeature />;
}

export default Login;
