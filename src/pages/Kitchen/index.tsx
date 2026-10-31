import Button from "../../components/ui/Button";
import Feedback from "../../components/ui/Feedback";
import Topbar from "../../components/layout/Topbar";
import KitchenAboutCard from "../../components/features/Kitchen/KitchenAboutCard";
import KitchenDetailsForm from "../../components/features/Kitchen/KitchenDetailsForm";
import KitchenEntryCard from "../../components/features/Kitchen/KitchenEntryCard";
import KitchenHero from "../../components/features/Kitchen/KitchenHero";
import KitchenSafetyCard from "../../components/features/Kitchen/KitchenSafetyCard";
import KitchenSettingsSkeleton from "../../components/features/Kitchen/KitchenSettingsSkeleton";
import KitchenTeamCard from "../../components/features/Kitchen/KitchenTeamCard";
import Mascot from "../../components/ui/Mascot";
import { getSession } from "../../services/authSession";
import useKitchenSettings from "../../hooks/useKitchenSettings";

function getUserLabel(name: string | undefined): { name: string; initials: string } {
    const parts = (name ?? "Usuário").trim().split(/\s+/).filter(Boolean);
    const displayName = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0] ?? "Usuário";
    const initials = parts.length > 1 ? [parts[0], parts.at(-1)] : parts;
    return {
        name: displayName,
        initials: initials.map((part) => [...(part ?? "")][0]?.toLocaleUpperCase("pt-BR") ?? "").join("") || "IN",
    };
}

function getRoleLabel(profile: string | { name?: string; accessType?: string } | null | undefined): string {
    const role = typeof profile === "string" ? profile : profile?.name ?? profile?.accessType ?? "Membro";
    return role.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function Kitchen() {
    const session = getSession();
    const profile = session?.user.profile;
    const accessType = typeof profile === "string" ? profile : profile?.accessType;
    const canManage = accessType?.toLocaleUpperCase("pt-BR") === "SUPERVISOR";
    const kitchenId = session?.user.kitchen?.id ?? null;
    const [state, actions] = useKitchenSettings(kitchenId, canManage);
    const user = getUserLabel(session?.user.name);
    const role = getRoleLabel(profile);

    return (
        <div className="flex min-h-screen min-w-0 flex-col bg-linear-to-b from-history-background-start to-history-background-end adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start">
            <Topbar
                title="Cozinha"
                description="Os dados, o código e a situação da sua cozinha"
                userInitials={user.initials}
                userPhotoUrl={session?.user.photoUrl}
                userName={user.name}
                userRole={role}
            />
            <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                {state.loading ? <KitchenSettingsSkeleton /> : state.error ? (
                    <div className="grid min-w-0 place-items-center px-4 py-12 sm:px-6">
                        <section className="grid w-full max-w-2xl justify-items-center gap-4 rounded-4xl bg-surface p-6 text-center shadow-history-card sm:p-10" aria-labelledby="kitchen-load-error-title">
                            <h2 id="kitchen-load-error-title" className="m-0 font-k2d text-xl font-bold text-ink">Não foi possível carregar a cozinha</h2>
                            <Feedback severity="error">{state.error}</Feedback>
                            <Button variant="standard" type="button" onClick={actions.retryKitchen}>Tentar novamente</Button>
                        </section>
                    </div>
                ) : !state.kitchen ? (
                    <div className="grid min-w-0 place-items-center px-4 py-12 sm:px-6">
                        <section className="grid w-full max-w-2xl justify-items-center gap-4 rounded-4xl bg-surface p-6 text-center shadow-history-card sm:p-10" aria-labelledby="kitchen-missing-title">
                            <Mascot size="amplo" className="max-w-28" />
                            <h2 id="kitchen-missing-title" className="m-0 font-k2d text-xl font-bold text-ink">Sua conta ainda não está vinculada a uma cozinha</h2>
                            <p className="m-0 max-w-prose text-sm leading-relaxed text-history-muted">Peça ao supervisor para vincular sua conta a uma cozinha. Quando a associação estiver ativa, os dados e as opções de gestão aparecerão aqui.</p>
                        </section>
                    </div>
                ) : (
                    <div className="grid min-w-0 gap-5 px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
                        <KitchenHero kitchen={state.kitchen} roleLabel={role} />
                        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-3 large-text:grid-cols-1">
                            <div className="grid min-w-0 content-start gap-5 xl:col-span-2">
                                <KitchenDetailsForm
                                    kitchen={state.kitchen}
                                    canEdit={canManage}
                                    saving={state.detailsSaving}
                                    error={state.detailsError}
                                    success={state.detailsSuccess}
                                    onSave={actions.saveDetails}
                                    onClearFeedback={actions.clearDetailsFeedback}
                                />
                                <KitchenEntryCard
                                    kitchen={state.kitchen}
                                    canEdit={canManage}
                                    savingDiscovery={state.discoverySaving}
                                    discoveryError={state.discoveryError}
                                    discoverySuccess={state.discoverySuccess}
                                    onDiscoveryChange={actions.setDiscovery}
                                />
                                <KitchenSafetyCard
                                    kitchen={state.kitchen}
                                    canEdit={canManage}
                                    saving={state.statusSaving}
                                    error={state.statusError}
                                    onStatusChange={actions.setKitchenActive}
                                />
                            </div>
                            <aside className="grid min-w-0 content-start gap-5">
                                <KitchenAboutCard kitchen={state.kitchen} roleLabel={role} canManage={canManage} />
                                <KitchenTeamCard
                                    kitchenId={state.kitchen.id}
                                    canManage={canManage}
                                    users={state.users}
                                    accessRequests={state.accessRequests}
                                    loading={state.teamLoading}
                                    error={state.teamError}
                                    onRetry={actions.retryTeam}
                                />
                                <section className="flex min-w-0 items-center gap-4 rounded-4xl border border-sidebar-line bg-sidebar-active p-5 sm:p-6">
                                    <Mascot size="compacto" className="max-w-20 shrink-0" />
                                    <div className="grid min-w-0 gap-2">
                                        <h2 className="m-0 font-k2d text-base font-bold text-ink">O código é a chave da cozinha</h2>
                                        <p className="m-0 text-sm leading-relaxed text-history-muted">Só compartilhe com quem faz parte do time. Mesmo com a descoberta desligada, o código continua válido.</p>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Kitchen;
