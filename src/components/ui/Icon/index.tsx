import type { ComponentPropsWithoutRef } from "react";
import sprite from "../../../assets/icons/interface.svg?no-inline";
export type IconName = "pin" | "info" | "warning" | "minus" | "clock" | "plus" | "close" | "check" | "chevron" | "arrow" | "logout" | "mic" | "sort" | "cursor";
interface IconProps extends ComponentPropsWithoutRef<"svg"> { name: IconName }
export default function Icon({ name, className = "size-5 shrink-0", ...props }: IconProps) {
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}><use href={`${sprite}#${name}`} /></svg>;
}
