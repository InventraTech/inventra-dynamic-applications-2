import { forwardRef, type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "link" | "icon" | "standard" | "outline" | "success" | "danger" | "subtle-danger" | "accent" | "ghost";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
    variant: ButtonVariant;
}

const focusClasses = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const disabledClasses = "disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
    primary: "flex min-h-login-button-height items-center justify-center rounded-login-button bg-brand px-5 py-3 text-login-button font-bold text-on-brand transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-70",
    link: "cursor-pointer border-0 bg-transparent p-0 font-bold text-login-brand-end transition-colors hover:text-login-brand-start hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-login-brand-start focus-visible:outline-offset-4",
    icon: "flex min-h-11 min-w-11 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
    standard: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 font-k2d text-sm font-bold text-on-brand transition-colors hover:bg-brand-strong " + focusClasses + " " + disabledClasses,
    outline: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-history-border bg-surface px-4 py-2 font-k2d text-sm font-bold text-sidebar-purple transition-colors hover:bg-history-card-header " + focusClasses + " " + disabledClasses,
    success: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-feedback-success px-4 py-2 font-k2d text-sm font-bold text-on-brand transition-colors hover:bg-feedback-success/90 " + focusClasses + " " + disabledClasses,
    danger: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-feedback-error px-4 py-2 font-k2d text-sm font-bold text-on-brand transition-colors hover:bg-feedback-error/90 " + focusClasses + " " + disabledClasses,
    "subtle-danger": "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-feedback-error-bg px-4 py-2 font-k2d text-sm font-bold text-feedback-error transition-colors hover:brightness-95 " + focusClasses + " " + disabledClasses,
    accent: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-login-gold px-4 py-2.5 font-k2d text-sm font-bold text-brand-strong transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand " + disabledClasses,
    ghost: "inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2 py-1 font-k2d text-sm font-bold transition-colors " + focusClasses + " " + disabledClasses,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className = "", variant, ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            className={(variantClasses[variant] + " " + className + " cursor-pointer disabled:cursor-not-allowed").trim()}
            {...props}
        />
    );
});

export default Button;
