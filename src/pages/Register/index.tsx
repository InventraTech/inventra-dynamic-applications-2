import { Navigate } from "react-router-dom";

import RegisterFeature from "../../components/features/Register";
import { useAuth } from "../../context/auth";

function Register() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/home" replace />;

    return <RegisterFeature />;
}

export default Register;
