import test from "node:test";
import assert from "node:assert/strict";

import type { AuthSession } from "../src/types/auth.ts";
import type { KitchenStockItem } from "../src/types/stock.ts";
import { readAuthSession } from "../src/utils/authSessionSchema.ts";
import { validateLogin } from "../src/utils/loginValidation.ts";
import { validateProductKitchenParameters } from "../src/utils/productKitchenValidation.ts";
import { validateProductReference } from "../src/utils/productReferenceValidation.ts";
import { validateProductSupplier } from "../src/utils/productSupplierValidation.ts";
import { validateStockConsumption, validateStockEntry, type StockEntryFormValues } from "../src/utils/stockValidation.ts";
import { validateOptionalAccessReason } from "../src/utils/teamAccessValidation.ts";

const validSession = (overrides: Partial<AuthSession> = {}): AuthSession => ({
    _versao: 1,
    token: "example-token",
    expiresAt: 10_000,
    user: { id: "user-1", name: "Ana", email: "ana@example.com", kitchen: null },
    ...overrides,
});

test("migrate a valid legacy session to schema version 1", () => {
    const { _versao: _version, ...legacy } = validSession();
    const result = readAuthSession(legacy, 1_000);

    assert.equal(result.migrated, true);
    assert.equal(result.session?._versao, 1);
    assert.equal(result.session?.token, "example-token");
});

test("retain a valid versioned session and reject an unsupported schema", () => {
    assert.equal(readAuthSession(validSession(), 1_000).migrated, false);
    assert.equal(readAuthSession({ ...validSession(), _versao: 99 }, 1_000).session, null);
});

test("discard expired and malformed sessions", () => {
    assert.equal(readAuthSession(validSession(), 10_000).session, null);
    assert.equal(readAuthSession({ token: "x", expiresAt: 10_000, user: {} }, 1_000).session, null);
    assert.equal(readAuthSession({ ...validSession(), user: { id: "user-1" } }, 1_000).session, null);
});

test("login validation normalizes email and blocks invalid requests", () => {
    const valid = validateLogin({ email: " ana@example.com ", password: "secret-123" });
    assert.deepEqual(valid.values, { email: "ana@example.com", password: "secret-123" });
    assert.equal(validateLogin({ email: "inválido", password: "" }).values, null);
});

test("product kitchen parameters reject invalid ranges and normalize decimals", () => {
    const invalid = validateProductKitchenParameters({ minStock: "10", maxStock: "5", averageDailyConsumption: "" });
    assert.equal(invalid.values, null);
    assert.ok(invalid.errors.maxStock);

    const valid = validateProductKitchenParameters({ minStock: "1,25", maxStock: "2", averageDailyConsumption: "0,5" });
    assert.deepEqual(valid.values, { minStock: 1.25, maxStock: 2, averageDailyConsumption: 0.5 });
});

test("product reference validation trims values and requires a unit description", () => {
    const invalid = validateProductReference("unit", { primary: " kg ", description: " " });
    assert.equal(invalid.values, null);
    assert.ok(invalid.errors.description);

    const valid = validateProductReference("category", { primary: " Grãos ", description: " Básicos " });
    assert.deepEqual(valid.values, { primary: "Grãos", description: "Básicos" });
});

test("product supplier validation enforces available suppliers and normalizes values", () => {
    const input = { supplierId: "7", supplierCode: " REF-1 ", referencePrice: "12,50", leadTimeDays: "3" };
    const valid = validateProductSupplier(input, new Set([7]));
    assert.deepEqual(valid.value, { supplierId: 7, supplierCode: "REF-1", referencePrice: 12.5, leadTimeDays: 3 });
    assert.equal(validateProductSupplier(input, new Set()).value, null);
});

test("stock consumption validation enforces available balance", () => {
    const product: KitchenStockItem = {
        product: { id: 8, name: "Arroz", brand: null, photoUrl: null },
        category: null,
        unit: { id: 1, symbol: "kg" },
        totalQuantity: 4,
        activeBatches: 1,
        nextExpirationDate: null,
        minStock: null,
        lowStock: false,
    };

    assert.equal(validateStockConsumption({ productId: "8", quantity: "4,5" }, [product]).value, null);
    assert.deepEqual(validateStockConsumption({ productId: "8", quantity: "2,5" }, [product]).value, { productId: 8, quantity: 2.5 });
});

test("stock entry validation checks selected records, exact dates and field limits", () => {
    const product: KitchenStockItem = {
        product: { id: 8, name: "Arroz", brand: null, photoUrl: null },
        category: null,
        unit: { id: 1, symbol: "kg" },
        totalQuantity: 4,
        activeBatches: 1,
        nextExpirationDate: null,
        minStock: null,
        lowStock: false,
    };
    const values: StockEntryFormValues = {
        productId: "8",
        supplierId: "",
        batchNumber: " lote-12 ",
        invoiceNumber: " NF-1 ",
        initialQuantity: "3,5",
        entryDate: "2026-11-01",
        expirationDate: "2026-12-01",
        unitPrice: "10,25",
    };
    const valid = validateStockEntry(values, 1, [product], []);
    assert.deepEqual(valid.value, {
        productId: 8,
        kitchenId: 1,
        batchNumber: "lote-12",
        invoiceNumber: "NF-1",
        initialQuantity: 3.5,
        entryDate: "2026-11-01",
        expirationDate: "2026-12-01",
        unitPrice: 10.25,
    });

    const invalid = validateStockEntry({ ...values, entryDate: "2026-02-30", invoiceNumber: "x".repeat(51) }, 1, [product], []);
    assert.equal(invalid.value, null);
    assert.ok(invalid.errors.entryDate);
    assert.ok(invalid.errors.invoiceNumber);
});

test("optional access rejection reason is normalized and limited", () => {
    assert.deepEqual(validateOptionalAccessReason("  motivo informado  "), { value: "motivo informado", error: null });
    assert.deepEqual(validateOptionalAccessReason("   "), { value: undefined, error: null });
    assert.ok(validateOptionalAccessReason("x".repeat(256)).error);
});
