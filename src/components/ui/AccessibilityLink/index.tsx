import { Link } from "react-router-dom";
import accessibilityIcon from "../../../assets/icons/acessibilidade.svg";

function AccessibilityLink() {
    return (
        <Link
            className="absolute top-2 right-4 z-10 flex size-14 items-center justify-center rounded-full text-sidebar-purple transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus large-text:static large-text:mx-3 large-text:mt-3 large-text:self-start"
            to="/acessibilidade"
            aria-label="Acessibilidade"
            title="Acessibilidade"
        >
            <img className="size-8 object-contain adjusted-contrast:hidden" src={accessibilityIcon} alt="" />
            <svg className="hidden size-8 adjusted-contrast:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="5" r="2.25" />
                <path d="M4.5 9.5a25 25 0 0 0 15 0M12 10v4.5m0 0-4.5 6m4.5-6 4.5 6" />
            </svg>
        </Link>
    );
}

export default AccessibilityLink;
