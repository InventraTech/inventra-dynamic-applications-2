interface KitchenSectionHeadingProps {
    icon: string;
    title: string;
    description: string;
}

function KitchenSectionHeading({ icon, title, description }: KitchenSectionHeadingProps) {
    return (
        <header className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-login-field">
                <img src={icon} alt="" aria-hidden="true" className="size-5" />
            </span>
            <span className="grid min-w-0 gap-1">
                <h2 className="m-0 wrap-anywhere font-k2d text-lg font-bold leading-tight text-ink sm:text-xl">{title}</h2>
                <span className="wrap-anywhere text-sm leading-snug text-history-muted">{description}</span>
            </span>
        </header>
    );
}

export default KitchenSectionHeading;
