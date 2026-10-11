import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "link" | "icon";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
    variant: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "flex min-h-login-button-height items-center justify-center rounded-login-button bg-login-brand-end px-5 py-3 text-login-button font-bold text-white transition-colors hover:bg-login-brand-start focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-70",
    link: "cursor-pointer border-0 bg-transparent p-0 font-bold text-login-brand-end transition-colors hover:text-login-brand-start hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4",
    icon: "flex items-center justify-center rounded-lg text-login-muted transition-colors hover:text-login-brand-end focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-2",
};

function Button({ className = "", variant, ...props }: ButtonProps) {
    return (
        <button
            className={`${variantClasses[variant]} ${className} cursor-pointer`.trim()}
            {...props}
        />
    );
}

export default Button;
