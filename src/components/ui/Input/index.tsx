import { forwardRef, type ComponentPropsWithoutRef } from "react";

type InputVariant = "text" | "checkbox";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
    variant?: InputVariant;
}

const variantClasses: Record<InputVariant, string> = {
    text: "h-login-input-height min-w-0 w-full rounded-login-control border border-login-field-border bg-login-field px-login-input-x text-login-input text-login-ink outline-none transition-colors placeholder:text-login-placeholder focus-visible:border-login-brand-end focus-visible:ring-4 focus-visible:ring-login-focus aria-invalid:border-login-error",
    checkbox: "size-login-checkbox shrink-0 accent-login-brand-end",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { className = "", variant = "text", ...props },
    ref,
) {
    return (
        <input
            ref={ref}
            className={`${variantClasses[variant]} ${className}`.trim()}
            {...props}
        />
    );
});

export default Input;
