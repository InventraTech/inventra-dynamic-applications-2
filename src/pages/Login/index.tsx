import { Navigate } from "react-router-dom";

import LoginFeature from "../../components/features/Login";
import { getSession } from "../../services/authSession";

function Login() {
    if (getSession()) return <Navigate to="/historico" replace />;

    return <LoginFeature />;
}

export default Login;