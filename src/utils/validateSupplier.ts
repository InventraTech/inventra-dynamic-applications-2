export interface SupplierFormValues {
    legalName: string;
    cnpj: string;
    email: string;
    whatsapp: string;
}

export type SupplierFormErrors = Partial<Record<keyof SupplierFormValues, string>>;

export const SUPPLIER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateSupplier(values: SupplierFormValues): SupplierFormErrors {
    const errors: SupplierFormErrors = {};
    const legalName = values.legalName.trim();
    const cnpjDigits = values.cnpj.replace(/\D/g, "");
    const email = values.email.trim();
    const whatsapp = values.whatsapp.trim();

    if (!legalName) errors.legalName = "Informe a razão social.";
    else if (legalName.length > 150) errors.legalName = "Use até 150 caracteres.";

    if (!cnpjDigits) errors.cnpj = "Informe o CNPJ.";
    else if (cnpjDigits.length !== 14) errors.cnpj = "Informe os 14 dígitos do CNPJ.";
    else if (values.cnpj.length > 18) errors.cnpj = "Use até 18 caracteres.";

    if (email.length > 150) errors.email = "Use até 150 caracteres.";
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";

    if (whatsapp.length > 20) errors.whatsapp = "Use até 20 caracteres.";

    return errors;
}

export function formatSupplierCnpj(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function validateSupplierPhoto(file: File): string | null {
    if (!allowedPhotoTypes.has(file.type)) return "Escolha uma imagem JPEG, PNG ou WebP.";
    if (file.size > SUPPLIER_PHOTO_MAX_BYTES) return "A imagem deve ter até 5 MB.";
    if (file.size === 0) return "O arquivo selecionado está vazio.";
    return null;
}
