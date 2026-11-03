import type { ComponentPropsWithoutRef } from "react";

import mascotHead from "../../../assets/images/mascote-cabeca.svg";

type MascoteSize = "compacto" | "amplo";

interface MascoteProps extends Omit<ComponentPropsWithoutRef<"img">, "src" | "alt" | "aria-hidden" | "width" | "height"> {
    size: MascoteSize;
}

const sizeClasses: Record<MascoteSize, string> = {
    compacto: "w-login-form-mascot",
    amplo: "w-33",
};

function Mascote({ size, className, ...props }: MascoteProps) {
    const imageClassName = [sizeClasses[size], className].filter(Boolean).join(" ");

    return <img {...props} src={mascotHead} alt="" aria-hidden="true" className={imageClassName} />;
}

export default Mascote;
