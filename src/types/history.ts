export type HistoryMode = "withdrawal" | "purchase";

export type StatusTone = "complete" | "pending" | "observation";

export interface HistoryRow {
    key: string;
    status: string;
    statusTone: StatusTone;
    reason?: string;
    initial: string;
    product: string;
    id: string;
    date: string;
    time: string;
    quantity: string;
    brand: string;
}

export interface HistoryProps {
    mode: HistoryMode;
}

export interface StatusBadgeProps extends HistoryProps {
    row: HistoryRow;
}

export interface HistoryTableProps extends HistoryProps {
    rows: HistoryRow[];
    totalRows: number;
    page: number;
    pageCount: number;
    loading: boolean;
    error: string | null;
    canRetry: boolean;
    onPageChange: (page: number) => void;
    onRetry: () => void;
}
