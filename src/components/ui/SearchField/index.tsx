import { useId, type ComponentPropsWithoutRef } from "react";
import searchIcon from "../../../assets/icons/busca.svg";

interface SearchFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "className"> {
    label: string;
    variant?: "plain" | "brand";
    className?: string;
}

function SearchField({ label, variant = "plain", className = "", id, ...props }: SearchFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
        <div className={`search-field flex min-h-11 min-w-0 items-center gap-2 rounded-full border border-transparent px-4 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${variant === "brand" ? "bg-white/12 text-on-brand" : "bg-surface text-sidebar-text"} ${className}`}>
            <label className="sr-only" htmlFor={inputId}>{label}</label>
            <img className={`size-4.5 shrink-0 ${variant === "brand" ? "brightness-0 invert" : ""}`} src={searchIcon} alt="" />
            <input id={inputId} type="search" className="search-field-input min-w-0 flex-1 bg-transparent text-sm leading-normal outline-none placeholder:text-current placeholder:opacity-90 disabled:cursor-not-allowed" {...props} />
        </div>
    );
}

export default SearchField;
