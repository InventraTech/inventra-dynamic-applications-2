import { useState, type ComponentPropsWithoutRef } from "react";

interface UserAvatarProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    name: string;
    photoUrl?: string | null;
    fallbackImageUrl?: string;
    fallbackText?: string;
    alt?: string;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "?";
}

function UserAvatar({ name, photoUrl, fallbackImageUrl, fallbackText, alt, className = "", ...props }: UserAvatarProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const imageUrl = photoUrl && failedImageUrl !== photoUrl
        ? photoUrl
        : fallbackImageUrl && failedImageUrl !== fallbackImageUrl
            ? fallbackImageUrl
            : null;

    return (
        <span
            {...props}
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-active font-k2d font-bold text-sidebar-purple ${className}`}
            {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        >
            {imageUrl
                ? <img className="absolute inset-0 size-full object-cover" src={imageUrl} alt="" onError={() => setFailedImageUrl(imageUrl)} />
                : <span aria-hidden="true">{fallbackText ?? getInitials(name)}</span>}
        </span>
    );
}

export default UserAvatar;
