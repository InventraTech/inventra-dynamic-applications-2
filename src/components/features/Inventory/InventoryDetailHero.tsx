import { Link } from "react-router-dom";
import type { Inventory } from "../../../types/inventory";
import { formatInventoryDate } from "../../../utils/inventoryPresentation";
import InventoryHero from "./InventoryHero";

interface InventoryDetailHeroProps {
    inventory: Inventory;
}

export default function InventoryDetailHero({ inventory }: InventoryDetailHeroProps) {
    const description = [
        `Aberto por ${inventory.responsible.name} em ${formatInventoryDate(inventory.startedAt, { hour: "2-digit", minute: "2-digit" })}`,
        inventory.note?.trim(),
    ].filter(Boolean).join(" · ");

    return (
        <InventoryHero
            kitchenName={inventory.kitchen.name}
            title={`Inventário #${inventory.id}`}
            description={description}
            actions={<Link to="/inventarios" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 font-k2d text-sm font-bold text-on-brand transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand">Todos os inventários</Link>}
        />
    );
}
