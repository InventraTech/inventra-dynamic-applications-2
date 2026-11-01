import { useState } from "react";
import type { Supplier } from "../../../types/suppliers";

interface SupplierAvatarProps {
    supplier: Pick<Supplier, "legalName" | "photoUrl">;
    size?: "small" | "medium" | "large";
}

const sizeClasses = {
    small: "size-10 text-xs",
    medium: "size-14 text-base",
    large: "size-20 text-xl",
} as const;

function initials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((word) => [...word][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "F";
}

function SupplierAvatar({ supplier, size = "small" }: SupplierAvatarProps) {
    const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
    const photoUrl = supplier.photoUrl && failedPhoto !== supplier.photoUrl ? supplier.photoUrl : null;

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sidebar-line bg-sidebar-active font-k2d font-bold text-sidebar-purple ${sizeClasses[size]}`}
            role="img"
            aria-label={photoUrl ? `Foto de ${supplier.legalName}` : `Iniciais de ${supplier.legalName}`}
        >
            {photoUrl
                ? <img className="size-full object-cover" src={photoUrl} alt="" onError={() => setFailedPhoto(photoUrl)} />
                : <span aria-hidden="true">{initials(supplier.legalName)}</span>}
        </span>
    );
}

export default SupplierAvatar;
