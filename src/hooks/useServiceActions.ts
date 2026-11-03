import { useMemo } from "react";

import { login, register, getCurrentUser } from "../services/authService";
import { clearSession, saveSession, updateSessionKitchen, updateSessionUser } from "../services/authSession";
import { changeUserPassword, removeCurrentUserPhoto, updateUserName, uploadCurrentUserPhoto } from "../services/userService";
import { createKitchen } from "../services/kitchenService";
import { createCategory, deleteCategory, getProductCategories, updateCategory } from "../services/categories";
import { createUnit, deleteUnit, getProductUnits, updateUnit } from "../services/units";
import { deleteProductPhoto, getProduct, getProductKitchenParameters, lookupProductBarcode, searchProductsForKitchen, setKitchenParameters, setProductActive, createProduct, updateProduct, uploadProductPhoto } from "../services/products";
import { getActiveSuppliers, getSupplier } from "../services/suppliers";
import { getProductSuppliers, linkProductSupplier } from "../services/productSuppliers";
import { getHistoryRequests } from "../services/history";
import { approveRequisition, cancelRequisition, createRequisition, getKitchenRequisitions, rejectRequisition, submitRequisition, addRequisitionItem, removeRequisitionItem } from "../services/requisitions";
import { activateTeamUser, approveKitchenAccess, createTeamUser, deactivateTeamUser, getKitchenAccessRequests, getTeamProfiles, getTeamUsers, rejectKitchenAccess, updateTeamUser } from "../services/teamAccess";

/** Typed service adapters keep feature components independent from src/services imports. */
export function useAuthServiceActions() {
    return useMemo(() => ({ login, register, getCurrentUser, clearSession, saveSession, updateSessionKitchen, updateSessionUser }), []);
}

export function useProfileServiceActions() {
    return useMemo(() => ({ getCurrentUser, updateSessionUser, changeUserPassword, clearSession, removeCurrentUserPhoto, updateUserName, uploadCurrentUserPhoto }), []);
}

export function useKitchenServiceActions() {
    return useMemo(() => ({ createKitchen, updateSessionKitchen }), []);
}

export function useProductServiceActions() {
    return useMemo(() => ({
        getProductCategories, getProductUnits, createCategory, deleteCategory, updateCategory,
        createUnit, deleteUnit, updateUnit, deleteProductPhoto, getProduct, getProductKitchenParameters,
        lookupProductBarcode, searchProductsForKitchen, setKitchenParameters, setProductActive,
        createProduct, updateProduct, uploadProductPhoto, getActiveSuppliers, getProductSuppliers,
        linkProductSupplier,
    }), []);
}

export function useHistoryServiceActions() {
    return useMemo(() => ({ getHistoryRequests }), []);
}

export function useRequisitionServiceActions() {
    return useMemo(() => ({
        approveRequisition, cancelRequisition, createRequisition, getKitchenRequisitions,
        rejectRequisition, submitRequisition, addRequisitionItem, removeRequisitionItem,
    }), []);
}

export function useSupplierServiceActions() {
    return useMemo(() => ({ getSupplier }), []);
}

export function useTeamAccessServiceActions() {
    return useMemo(() => ({
        activateTeamUser, approveKitchenAccess, createTeamUser, deactivateTeamUser,
        getKitchenAccessRequests, getTeamProfiles, getTeamUsers, rejectKitchenAccess, updateTeamUser,
    }), []);
}
