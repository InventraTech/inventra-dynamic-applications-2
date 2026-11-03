import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/auth";
import Button from "../../../ui/Button";
import Dialog from "../../../ui/Dialog";
import Icon from "../../../ui/Icon";
export default function ProfileSignOutCard() {
 const [confirm, setConfirm] = useState(false);
 const { signOut } = useAuth(); const navigate = useNavigate();
 return <section className="space-y-3 rounded-3xl border border-history-border bg-surface p-5">
  <h2 className="text-lg font-bold text-ink">Sessão</h2><p className="text-sm text-history-muted">Encerre o acesso à sua conta neste navegador.</p>
  <Button variant="subtle-danger" className="w-full" onClick={() => setConfirm(true)} aria-haspopup="dialog"><Icon name="logout" />Sair da conta</Button>
  <Dialog open={confirm} onOpenChange={setConfirm} aria-labelledby="signout-title" aria-describedby="signout-description"><div className="space-y-4 p-6"><h2 id="signout-title" className="text-xl font-bold">Sair da sua conta?</h2><p id="signout-description">Você precisará entrar novamente para acessar sua cozinha.</p><div className="flex flex-wrap justify-end gap-3"><Button variant="outline" autoFocus onClick={() => setConfirm(false)}>Continuar na conta</Button><Button variant="danger" onClick={() => { signOut(); navigate("/login", { replace: true }); }}>Sim, sair da conta</Button></div></div></Dialog>
 </section>;
}
