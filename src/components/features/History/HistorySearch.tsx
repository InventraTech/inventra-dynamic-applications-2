import type { HistoryMode } from "../../../types/history";
import SearchField from "../../ui/SearchField";

interface HistorySearchProps { mode: HistoryMode; value: string; onChange: (value: string) => void }

function HistorySearch({ mode, value, onChange }: HistorySearchProps) {
    return <SearchField className="w-full shadow-history-card xl:w-85 large-text:w-full" label={mode === "withdrawal" ? "Buscar retiradas por produto, pessoa ou número" : "Buscar solicitações de compra por produto, pessoa ou número"} placeholder="Buscar por produto, pessoa ou nº" value={value} onChange={(event) => onChange(event.target.value)} />;
}

export default HistorySearch;
