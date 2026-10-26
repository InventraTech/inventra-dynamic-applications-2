import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Navegação estrutural" className="min-w-0">
            <ol className="flex min-w-0 list-none flex-wrap items-center gap-2 p-0 text-sm text-history-muted">
                {items.map((item, index) => {
                    const current = index === items.length - 1;
                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            {index > 0 && <li aria-hidden="true">/</li>}
                            <li className="min-w-0 max-w-full wrap-anywhere">
                                {item.href && !current
                                    ? <Link className="rounded-sm underline-offset-2 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" to={item.href}>{item.label}</Link>
                                    : <span aria-current={current ? "page" : undefined} className={current ? "font-semibold text-ink" : ""}>{item.label}</span>}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
