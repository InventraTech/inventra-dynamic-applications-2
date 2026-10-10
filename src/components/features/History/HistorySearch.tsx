import type { HistoryMode } from "../../../types/history";
import withdrawalSearchIcon from "../../../assets/icons/history-1-table-search.svg";
import purchaseSearchIcon from "../../../assets/icons/history-2-table-search.svg";

interface HistorySearchProps {
    mode: HistoryMode;
    value: string;
    onChange: (value: string) => void;
}

function HistorySearch({ mode, value, onChange }: HistorySearchProps) {
    return (
        <label className="flex h-10 w-full max-w-68 shrink-0 items-center gap-2 overflow-hidden rounded-full bg-white px-4 shadow-history-card sm:w-68">
            <img src={mode === "withdrawal" ? withdrawalSearchIcon : purchaseSearchIcon} alt="" aria-hidden="true" />
            <input
                className="min-w-0 flex-1 bg-transparent font-k2d text-history-body text-history-search-placeholder outline-none placeholder:text-history-search-placeholder"
                type="search"
                aria-label="Buscar no histórico"
                placeholder="Buscar por produto ou ID"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}

export default HistorySearch;
