import { useDeferredValue, useEffect, useRef, useState } from "react";
import { ApiError } from "../../../services/api";
import { getSupplier } from "../../../services/suppliers";
import type { Supplier, SupplierDialogMode, SupplierStatusFilter } from "../../../types/suppliers";
import type { SupplierFormSubmission } from "./SupplierFormDialog";
import { useSupplierActions } from "../../../hooks/useSupplierActions";
import { useSuppliers } from "../../../hooks/useSuppliers";
import Button from "../../ui/Button";
import Feedback from "../../ui/Feedback";
import SupplierDetailDialog from "./SupplierDetailDialog";
import SupplierEmptyState from "./SupplierEmptyState";
import SupplierFormDialog from "./SupplierFormDialog";
import SupplierHero from "./SupplierHero";
import SupplierLoadingSkeleton from "./SupplierLoadingSkeleton";
import SupplierStatusDialog from "./SupplierStatusDialog";
import SupplierSummary from "./SupplierSummary";
import SupplierTable from "./SupplierTable";
import SupplierToolbar from "./SupplierToolbar";

interface SupplierManagementProps {
    canManage: boolean;
}

function getDetailError(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end.";
    return "Tente novamente mais tarde.";
}

function restoreFocus(trigger: HTMLButtonElement | null) {
    window.requestAnimationFrame(() => {
        if (trigger?.isConnected) trigger.focus();
        else document.getElementById("conteudo-principal")?.focus();
    });
}

function SupplierManagement({ canManage }: SupplierManagementProps) {
    const suppliers = useSuppliers(canManage);
    const actions = useSupplierActions();
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [filter, setFilter] = useState<SupplierStatusFilter>("all");

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<SupplierDialogMode>("create");
    const [formSupplier, setFormSupplier] = useState<Supplier | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detailPhoto, setDetailPhoto] = useState<File | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusSupplier, setStatusSupplier] = useState<Supplier | null>(null);

    const formReturnTrigger = useRef<HTMLButtonElement | null>(null);
    const detailReturnTrigger = useRef<HTMLButtonElement | null>(null);
    const statusReturnTrigger = useRef<HTMLButtonElement | null>(null);
    const detailRequest = useRef<AbortController | null>(null);
    const previousFormOpen = useRef(false);
    const previousDetailOpen = useRef(false);
    const previousStatusOpen = useRef(false);
    const suppressDetailRestore = useRef(false);

    useEffect(() => {
        if (previousFormOpen.current && !formOpen) restoreFocus(formReturnTrigger.current);
        previousFormOpen.current = formOpen;
    }, [formOpen]);

    useEffect(() => {
        if (previousDetailOpen.current && !detailOpen) {
            if (suppressDetailRestore.current) suppressDetailRestore.current = false;
            else restoreFocus(detailReturnTrigger.current);
        }
        previousDetailOpen.current = detailOpen;
    }, [detailOpen]);

    useEffect(() => {
        if (previousStatusOpen.current && !statusOpen) restoreFocus(statusReturnTrigger.current);
        previousStatusOpen.current = statusOpen;
    }, [statusOpen]);

    useEffect(() => () => detailRequest.current?.abort(), []);

    const statusSuppliers = filter === "active"
        ? suppliers.activeSuppliers
        : filter === "inactive"
            ? suppliers.inactiveSuppliers
            : suppliers.allSuppliers;
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("pt-BR");
    const digitSearch = deferredSearch.replace(/\D/g, "");
    const visibleSuppliers = statusSuppliers.filter((supplier) => {
        if (!normalizedSearch) return true;
        const textMatches = [supplier.legalName, supplier.cnpj, supplier.email ?? "", supplier.whatsapp ?? ""]
            .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
        const cnpjMatches = digitSearch.length > 0 && supplier.cnpj.replace(/\D/g, "").includes(digitSearch);
        return textMatches || cnpjMatches;
    });

    function openCreate(trigger: HTMLButtonElement | null = null) {
        actions.clearFeedback();
        formReturnTrigger.current = trigger;
        setFormSupplier(null);
        setFormMode("create");
        setFormOpen(true);
    }

    function openEdit(supplier: Supplier, trigger: HTMLButtonElement | null) {
        actions.clearFeedback();
        formReturnTrigger.current = trigger ?? detailReturnTrigger.current;
        setFormSupplier(supplier);
        setFormMode("edit");
        setFormOpen(true);
    }

    function openDetails(supplier: Supplier, trigger: HTMLButtonElement) {
        detailRequest.current?.abort();
        const controller = new AbortController();
        detailRequest.current = controller;
        actions.clearFeedback();
        detailReturnTrigger.current = trigger;
        setDetailSupplier(supplier);
        setDetailPhoto(null);
        setDetailError(null);
        setDetailLoading(true);
        setDetailOpen(true);

        getSupplier(supplier.id, controller.signal).then((freshSupplier) => {
            if (!controller.signal.aborted) setDetailSupplier(freshSupplier);
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setDetailError(getDetailError(error));
        }).finally(() => {
            if (!controller.signal.aborted) setDetailLoading(false);
        });
    }

    function closeDetails(open: boolean) {
        setDetailOpen(open);
        if (!open) {
            detailRequest.current?.abort();
            setDetailLoading(false);
            setDetailPhoto(null);
            setDetailSupplier(null);
        }
    }

    function openStatus(supplier: Supplier, trigger: HTMLButtonElement | null, fromDetails = false) {
        actions.clearFeedback();
        statusReturnTrigger.current = trigger ?? detailReturnTrigger.current;
        setStatusSupplier(supplier);
        setStatusOpen(true);
        if (fromDetails) {
            suppressDetailRestore.current = true;
            closeDetails(false);
        }
    }

    async function submitForm(submission: SupplierFormSubmission) {
        const result = formMode === "create"
            ? await actions.create(submission.values, submission.photo)
            : formSupplier
                ? await actions.update(formSupplier, submission.values, submission.photo, submission.removePhoto)
                : null;

        if (!result) return;
        setFormOpen(false);
        setFormSupplier(null);
        if (formMode === "create") setFilter("all");
        suppliers.reload();
    }

    async function confirmStatus() {
        if (!statusSupplier) return;
        const succeeded = await actions.changeStatus(statusSupplier);
        if (!succeeded) return;
        setStatusOpen(false);
        setStatusSupplier(null);
        setFilter("all");
        suppliers.reload();
    }

    async function uploadDetailPhoto() {
        if (!detailSupplier || !detailPhoto) return;
        const updated = await actions.uploadPhoto(detailSupplier.id, detailPhoto);
        if (!updated) return;
        setDetailSupplier(updated);
        setDetailPhoto(null);
        suppliers.reload();
    }

    async function removeDetailPhoto() {
        if (!detailSupplier) return;
        const updated = await actions.removePhoto(detailSupplier.id);
        if (!updated) return;
        setDetailSupplier(updated);
        setDetailPhoto(null);
        suppliers.reload();
    }

    const detailActionFeedback = actions.busyAction === "photo" || actions.feedback?.action === "photo"
        ? actions.feedback
        : null;

    if (suppliers.loading) return <SupplierLoadingSkeleton />;

    if (suppliers.error && suppliers.allSuppliers.length === 0) {
        return (
            <section className="grid min-w-0 gap-4 px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
                <SupplierHero canManage={canManage} onCreate={openCreate} />
                <div className="rounded-3xl bg-surface p-5 shadow-history-card sm:p-7">
                    <Feedback severity="error">{suppliers.error}</Feedback>
                    <Button variant="outline" type="button" onClick={suppliers.reload} className="mt-4">Tentar novamente</Button>
                </div>
                <SupplierFormDialog open={formOpen} mode={formMode} supplier={formSupplier} saving={actions.busyAction === "create" || actions.busyAction === "edit"} error={actions.feedback?.severity === "error" ? actions.feedback.message : null} onOpenChange={setFormOpen} onSubmit={submitForm} />
            </section>
        );
    }

    return (
        <section className="flex min-w-0 flex-col gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6">
            <SupplierHero canManage={canManage} onCreate={openCreate} />
            <SupplierSummary activeCount={suppliers.activeSuppliers.length} inactiveCount={canManage ? suppliers.inactiveSuppliers.length : null} />

            {suppliers.refreshing && <p className="sr-only" role="status" aria-live="polite">Atualizando a lista de fornecedores…</p>}
            {suppliers.error && <Feedback severity="error">A lista pode estar desatualizada. {suppliers.error} <button className="ml-1 font-bold underline underline-offset-2" type="button" onClick={suppliers.reload}>Tentar novamente</button></Feedback>}

            {suppliers.allSuppliers.length === 0 ? (
                <SupplierEmptyState
                    title={canManage ? "Nenhum fornecedor cadastrado" : "Nenhum fornecedor ativo disponível"}
                    description={canManage ? "Cadastre o primeiro fornecedor compartilhado entre as cozinhas do Inventra." : "Quando um supervisor cadastrar um fornecedor ativo, ele aparecerá nesta lista."}
                    canCreate={canManage}
                    onCreate={() => openCreate(null)}
                />
            ) : <>
                <section className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-label="Busca e filtros de fornecedores">
                    <SupplierToolbar
                        query={search}
                        onQueryChange={setSearch}
                        filter={filter}
                        onFilterChange={setFilter}
                        activeCount={suppliers.activeSuppliers.length}
                        inactiveCount={suppliers.inactiveSuppliers.length}
                        canSeeInactive={canManage}
                    />
                </section>
                <SupplierTable
                    suppliers={visibleSuppliers}
                    totalCount={statusSuppliers.length}
                    canManage={canManage}
                    emptyTitle={normalizedSearch ? `Nenhum fornecedor encontrado para “${deferredSearch.trim()}”.` : filter === "inactive" ? "Nenhum fornecedor inativo." : "Nenhum fornecedor ativo."}
                    emptyDescription={normalizedSearch ? "Confira a razão social, o CNPJ ou os dados de contato, ou limpe a busca." : "Escolha outra situação para consultar os demais cadastros."}
                    onClearFilters={() => { setSearch(""); setFilter("all"); }}
                    onView={openDetails}
                    onEdit={openEdit}
                    onChangeStatus={(supplier, trigger) => openStatus(supplier, trigger)}
                />
            </>}

            <Feedback severity="info">O cadastro é compartilhado entre cozinhas. O CNPJ é único e não muda depois da criação; a ligação com produtos é feita na tela de Produtos.</Feedback>

            {actions.feedback && !formOpen && !detailOpen && !statusOpen && <Feedback severity={actions.feedback.severity}>{actions.feedback.message}</Feedback>}

            <SupplierFormDialog
                open={formOpen}
                mode={formMode}
                supplier={formSupplier}
                saving={actions.busyAction === "create" || actions.busyAction === "edit"}
                error={actions.feedback?.severity === "error" ? actions.feedback.message : null}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setFormSupplier(null); }}
                onSubmit={submitForm}
            />

            <SupplierDetailDialog
                open={detailOpen}
                supplier={detailSupplier}
                canManage={canManage}
                photoFile={detailPhoto}
                photoBusy={actions.busyAction === "photo"}
                photoError={detailActionFeedback?.severity === "error" ? detailActionFeedback.message : null}
                photoNotice={detailActionFeedback?.severity === "success" ? detailActionFeedback.message : null}
                loading={detailLoading}
                loadError={detailError}
                onOpenChange={closeDetails}
                onEdit={(supplier) => {
                    formReturnTrigger.current = detailReturnTrigger.current;
                    openEdit(supplier, detailReturnTrigger.current);
                    suppressDetailRestore.current = true;
                    closeDetails(false);
                }}
                onChangeStatus={(supplier) => openStatus(supplier, null, true)}
                onSelectPhoto={(file) => { actions.clearFeedback(); setDetailPhoto(file); }}
                onUploadPhoto={uploadDetailPhoto}
                onRemovePhoto={removeDetailPhoto}
            />

            <SupplierStatusDialog
                open={statusOpen}
                supplier={statusSupplier}
                saving={actions.busyAction === "status"}
                error={actions.feedback?.severity === "error" ? actions.feedback.message : null}
                onOpenChange={(open) => { setStatusOpen(open); if (!open) setStatusSupplier(null); }}
                onConfirm={confirmStatus}
            />
        </section>
    );
}

export default SupplierManagement;
