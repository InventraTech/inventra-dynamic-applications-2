const guidance = [
    { title: "Compra", description: "A aprovação não registra entrada no estoque." },
    { title: "Consumo", description: "A aprovação baixa os itens do estoque." },
    { title: "Transferência", description: "Baixa a origem; sem entrada automática no destino." },
];

export default function RequisitionTypeGuidance() {
    return (
        <section className="grid min-w-0 gap-4 rounded-2xl bg-sidebar-active p-4 sm:grid-cols-3 sm:gap-6 sm:px-5" aria-label="O que acontece após a aprovação">
            {guidance.map((item) => (
                <div key={item.title} className="grid min-w-0 content-start gap-1">
                    <h3 className="m-0 text-sm font-bold text-brand">{item.title}</h3>
                    <p className="m-0 text-sm leading-relaxed text-ink">{item.description}</p>
                </div>
            ))}
        </section>
    );
}
