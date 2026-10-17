import { Outlet } from "react-router-dom";
import AccessibilityTools from "../components/layout/AccessibilityTools";

export default function PublicLayout() {
    return <><AccessibilityTools /><Outlet /></>;
}
