import type { AccessibilityCardProps } from "../../../types/accessibility";

function AccessibilityCard({ icon, title, description, children, className = "" }: AccessibilityCardProps) {
    return (
        <section className={`min-w-0 rounded-3xl border border-history-border bg-surface p-5 shadow-history-card max-sm:rounded-2xl max-sm:p-4 large-text:p-3 ${className}`}>
            <header className="mb-5 flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-login-field text-sidebar-purple large-text:hidden">
                    <img className="block size-7 shrink-0 object-contain adjusted-contrast:hidden" src={icon} alt="" aria-hidden="true" />
                    <span
                        className="hidden size-7 mask-contain mask-no-repeat bg-current adjusted-contrast:block"
                        style={{ maskImage: `url("${icon}")`, WebkitMaskImage: `url("${icon}")` }}
                        aria-hidden="true"
                    />
                </span>
                <div className="min-w-0 pt-0.5">
                    <h3 className="font-k2d text-base font-bold leading-tight text-sidebar-text">{title}</h3>
                    <p className="mt-1 font-k2d text-xs leading-relaxed text-history-muted">{description}</p>
                </div>
            </header>
            <div className="flex flex-col gap-5">{children}</div>
        </section>
    );
}

export default AccessibilityCard;
