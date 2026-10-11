import type { RequisitionDto, RequisitionItemDto, RequisitionStatus } from "./api";

export type HistoryMode = "withdrawal" | "purchase";

export interface HistoryItem extends RequisitionItemDto {
    product: RequisitionItemDto["product"] & {
        brand: string;
        unit: string;
    };
}

export interface HistoryRequest extends RequisitionDto {
    items: HistoryItem[];
}

export interface HistoryProps {
    mode: HistoryMode;
}

export interface HistoryListProps extends HistoryProps {
    requests: HistoryRequest[];
    loading: boolean;
    error: string | null;
    kitchenMissing: boolean;
    canCreateKitchen: boolean;
    canRetry: boolean;
    search: string;
    onRetry: () => void;
    onClearSearch: () => void;
}

export interface HistoryCardProps extends HistoryProps {
    request: HistoryRequest;
    expanded: boolean;
    onToggle: () => void;
}

export interface HistoryStatusBadgeProps {
    status: RequisitionStatus;
}
