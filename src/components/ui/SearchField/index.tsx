import { useId, type ComponentPropsWithoutRef } from "react";
import searchIcon from "../../../assets/icons/busca.svg";

interface SearchFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "className"> {
    label: string;
    variant?: "plain" | "brand" | "subtle";
    className?: string;
}

function SearchField({ label, variant = "plain", className = "", id, ...props }: SearchFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const variantClasses = {
        plain: "border-transparent bg-surface text-sidebar-text",
        brand: "border-transparent bg-white/12 text-on-brand",
        subtle: "border-history-border bg-history-card-header text-sidebar-text",
    };

    return (
        <div className={`search-field flex min-h-11 min-w-0 items-center gap-2 rounded-full border px-4 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${variantClasses[variant]} ${className}`}>
            <label className="sr-only" htmlFor={inputId}>{label}</label>
            <img className={`size-4.5 shrink-0 ${variant === "brand" ? "brightness-0 invert" : ""}`} src={searchIcon} alt="" />
            <input id={inputId} type="search" className="search-field-input min-w-0 flex-1 bg-transparent text-sm leading-normal outline-none placeholder:text-current placeholder:opacity-90 disabled:cursor-not-allowed" {...props} />
        </div>
    );
}

export default SearchField;
