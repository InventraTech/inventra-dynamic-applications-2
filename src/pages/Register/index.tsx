import { Navigate } from "react-router-dom";

import RegisterFeature from "../../components/features/Register";
import { getSession } from "../../services/authSession";

function Register() {
    if (getSession()) return <Navigate to="/historico" replace />;

    return <RegisterFeature />;
}

export default Register;
