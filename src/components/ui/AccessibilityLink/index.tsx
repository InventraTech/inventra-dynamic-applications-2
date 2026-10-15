import { Link } from "react-router-dom";
import accessibilityIcon from "../../../assets/icons/acessibilidade.svg";

function AccessibilityLink() {
    return (
        <Link
            className="absolute top-2 right-4 z-10 flex size-12 items-center justify-center rounded-2xl bg-login-field transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus large-text:static large-text:mx-3 large-text:mt-3 large-text:self-start"
            to="/acessibilidade"
            aria-label="Acessibilidade"
            title="Acessibilidade"
        >
            <img src={accessibilityIcon} alt="" />
        </Link>
    );
}

export default AccessibilityLink;
