import { useState } from "react";

import HistoryContent from "../../components/features/History";
import Topbar from "../../components/layout/Topbar";
import type { HistoryProps } from "../../types/history";
import { getSession } from "../../services/authSession";

function Historico({ mode }: HistoryProps) {
    const [session] = useState(() => getSession());
    const userName = session?.user.name ?? "Usuário";
    const userInitials = userName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => [...part][0]?.toLocaleUpperCase("pt-BR") ?? "")
        .join("") || "IN";
    const profile = session?.user.profile;
    const userRole = typeof profile === "string"
        ? profile
        : profile?.name ?? profile?.accessType?.replaceAll("_", " ") ?? "Usuário";

    return (
        <div className="flex min-h-screen flex-col bg-linear-to-b from-history-background-start to-history-background-end">
            <Topbar
                title="Histórico"
                description="Retiradas de estoque e solicitações de compra"
                userInitials={userInitials}
                userName={userName}
                userRole={userRole}
            />
            <HistoryContent mode={mode} />
        </div>
    );
}

export default Historico;
