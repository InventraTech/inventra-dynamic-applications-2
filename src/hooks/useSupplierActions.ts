import { useState } from "react";
import { ApiError } from "../services/api";
import {
    createSupplier,
    removeSupplierPhoto,
    setSupplierActive,
    updateSupplier,
    uploadSupplierPhoto,
} from "../services/suppliers";
import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from "../types/suppliers";
import type { SupplierFormValues } from "../utils/validateSupplier";

export type SupplierActionKind = "create" | "edit" | "status" | "photo" | null;

export interface SupplierActionFeedback {
    severity: "error" | "success";
    message: string;
}

export interface SupplierMutationOutcome {
    supplier: Supplier;
    partial: boolean;
}

export interface UseSupplierActionsResult {
    busyAction: SupplierActionKind;
    busySupplierId: number | null;
    feedback: SupplierActionFeedback | null;
    clearFeedback: () => void;
    create: (values: SupplierFormValues, photo: File | null) => Promise<SupplierMutationOutcome | null>;
    update: (supplier: Supplier, values: SupplierFormValues, photo: File | null, removePhoto: boolean) => Promise<SupplierMutationOutcome | null>;
    uploadPhoto: (supplierId: number, file: File) => Promise<Supplier | null>;
    removePhoto: (supplierId: number) => Promise<Supplier | null>;
    changeStatus: (supplier: Supplier) => Promise<boolean>;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof TypeError) return "Não foi possível conectar ao back-end. Confira se a API está iniciada e tente novamente.";
    return fallback;
}

function createInput(values: SupplierFormValues): CreateSupplierInput {
    return {
        legalName: values.legalName.trim(),
        cnpj: values.cnpj.trim(),
        email: values.email.trim() || null,
        whatsapp: values.whatsapp.trim() || null,
    };
}

function updateInput(values: SupplierFormValues): UpdateSupplierInput {
    const input: UpdateSupplierInput = { legalName: values.legalName.trim() };
    const email = values.email.trim();
    const whatsapp = values.whatsapp.trim();
    if (email) input.email = email;
    if (whatsapp) input.whatsapp = whatsapp;
    return input;
}

export function useSupplierActions(): UseSupplierActionsResult {
    const [busyAction, setBusyAction] = useState<SupplierActionKind>(null);
    const [busySupplierId, setBusySupplierId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<SupplierActionFeedback | null>(null);

    function clearFeedback() {
        setFeedback(null);
    }

    async function create(values: SupplierFormValues, photo: File | null): Promise<SupplierMutationOutcome | null> {
        setBusyAction("create");
        setBusySupplierId(null);
        setFeedback(null);
        try {
            const created = await createSupplier(createInput(values));
            if (photo) {
                try {
                    const withPhoto = await uploadSupplierPhoto(created.id, photo);
                    setFeedback({ severity: "success", message: "Fornecedor e foto cadastrados." });
                    return { supplier: withPhoto, partial: false };
                } catch (photoError) {
                    setFeedback({ severity: "error", message: `Fornecedor cadastrado, mas a foto não foi enviada. ${getErrorMessage(photoError, "Tente enviar a foto novamente pelos detalhes do fornecedor.")}` });
                    return { supplier: created, partial: true };
                }
            }
            setFeedback({ severity: "success", message: "Fornecedor cadastrado." });
            return { supplier: created, partial: false };
        } catch (error) {
            setFeedback({ severity: "error", message: getErrorMessage(error, "Não foi possível cadastrar o fornecedor.") });
            return null;
        } finally {
            setBusyAction(null);
            setBusySupplierId(null);
        }
    }

    async function update(supplier: Supplier, values: SupplierFormValues, photo: File | null, removePhoto: boolean): Promise<SupplierMutationOutcome | null> {
        setBusyAction("edit");
        setBusySupplierId(supplier.id);
        setFeedback(null);
        try {
            let updated = await updateSupplier(supplier.id, updateInput(values));
            try {
                if (removePhoto && supplier.photoUrl) updated = await removeSupplierPhoto(supplier.id);
                else if (photo) updated = await uploadSupplierPhoto(supplier.id, photo);
            } catch (photoError) {
                setFeedback({ severity: "error", message: `Os dados foram salvos, mas a foto não foi atualizada. ${getErrorMessage(photoError, "Tente a operação de foto novamente nos detalhes.")}` });
                return { supplier: updated, partial: true };
            }
            setFeedback({ severity: "success", message: "Dados do fornecedor atualizados." });
            return { supplier: updated, partial: false };
        } catch (error) {
            setFeedback({ severity: "error", message: getErrorMessage(error, "Não foi possível salvar as alterações do fornecedor.") });
            return null;
        } finally {
            setBusyAction(null);
            setBusySupplierId(null);
        }
    }

    async function uploadPhoto(supplierId: number, file: File): Promise<Supplier | null> {
        setBusyAction("photo");
        setBusySupplierId(supplierId);
        setFeedback(null);
        try {
            const supplier = await uploadSupplierPhoto(supplierId, file);
            setFeedback({ severity: "success", message: "Foto do fornecedor atualizada." });
            return supplier;
        } catch (error) {
            setFeedback({ severity: "error", message: getErrorMessage(error, "Não foi possível enviar a foto do fornecedor.") });
            return null;
        } finally {
            setBusyAction(null);
            setBusySupplierId(null);
        }
    }

    async function removePhoto(supplierId: number): Promise<Supplier | null> {
        setBusyAction("photo");
        setBusySupplierId(supplierId);
        setFeedback(null);
        try {
            const supplier = await removeSupplierPhoto(supplierId);
            setFeedback({ severity: "success", message: "Foto do fornecedor removida." });
            return supplier;
        } catch (error) {
            setFeedback({ severity: "error", message: getErrorMessage(error, "Não foi possível remover a foto do fornecedor.") });
            return null;
        } finally {
            setBusyAction(null);
            setBusySupplierId(null);
        }
    }

    async function changeStatus(supplier: Supplier): Promise<boolean> {
        setBusyAction("status");
        setBusySupplierId(supplier.id);
        setFeedback(null);
        try {
            await setSupplierActive(supplier.id, !supplier.active);
            setFeedback({ severity: "success", message: supplier.active ? "Fornecedor desativado e movido para Inativos." : "Fornecedor reativado e disponível na lista de Ativos." });
            return true;
        } catch (error) {
            setFeedback({ severity: "error", message: getErrorMessage(error, supplier.active ? "Não foi possível desativar o fornecedor." : "Não foi possível reativar o fornecedor.") });
            return false;
        } finally {
            setBusyAction(null);
            setBusySupplierId(null);
        }
    }

    return { busyAction, busySupplierId, feedback, clearFeedback, create, update, uploadPhoto, removePhoto, changeStatus };
}
