import type { HistoryMode } from "../../../types/history";
import searchIcon from "../../../assets/icons/busca.svg";

interface HistorySearchProps {
    mode: HistoryMode;
    value: string;
    onChange: (value: string) => void;
}

function HistorySearch({ mode, value, onChange }: HistorySearchProps) {
    return (
        <label className="flex h-12 w-full max-w-full shrink-0 items-center gap-2 overflow-hidden rounded-full bg-white px-5 shadow-history-card transition-shadow focus-within:ring-2 focus-within:ring-sidebar-indicator md:w-85 md:max-w-[42vw]">
            <img src={searchIcon} alt="" aria-hidden="true" width={18} height={18} />
            <input
                className="min-w-0 flex-1 bg-transparent font-k2d text-[15px] text-sidebar-text outline-none placeholder:text-history-search-placeholder"
                type="search"
                aria-label={mode === "withdrawal"
                    ? "Buscar retiradas por produto, pessoa ou número"
                    : "Buscar solicitações de compra por produto, pessoa ou número"}
                placeholder="Buscar por produto, pessoa ou nº"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}

export default HistorySearch;
