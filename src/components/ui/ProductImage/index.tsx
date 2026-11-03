import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import productIcon from "../../../assets/icons/produto.svg";

interface ProductImageProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    name: string;
    photoUrl: string | null | undefined;
    size?: "compact" | "regular";
}

export default function ProductImage({ name, photoUrl, size = "regular", className = "", ...props }: ProductImageProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl;

    useEffect(() => setFailedUrl(null), [photoUrl]);

    return (
        <span {...props} className={`grid shrink-0 place-items-center overflow-hidden rounded-xl bg-sidebar-active ${size === "compact" ? "size-12" : "size-11"} ${className}`.trim()}>
            {showPhoto
                ? <img src={photoUrl ?? undefined} alt={`Foto de ${name}`} className="size-full object-cover" onError={() => setFailedUrl(photoUrl ?? null)} />
                : <img src={productIcon} alt="" aria-hidden="true" className="size-6 object-contain" />}
        </span>
    );
}
