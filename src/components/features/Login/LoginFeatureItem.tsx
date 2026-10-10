interface LoginFeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

function LoginFeatureItem({ icon, title, description }: LoginFeatureItemProps) {
    return (
        <div className="flex min-w-0 items-center gap-login-feature-copy-offset">
            <span className="flex size-login-feature-icon shrink-0 items-center justify-center rounded-login-feature-icon-radius bg-login-field">
                <img className="h-1/2 w-1/2 object-contain" src={icon} alt="" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 w-login-feature-copy-width flex-col gap-login-feature-copy-gap leading-tight">
                <strong className="text-login-feature-title font-bold text-white">{title}</strong>
                <span className="text-login-feature-copy text-login-copy">{description}</span>
            </span>
        </div>
    );
}

export default LoginFeatureItem;
