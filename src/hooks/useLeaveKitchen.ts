import type { LeaveKitchenControls } from "../types/kitchen";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaveCurrentKitchen } from "../services/userService";
import { updateSessionUser } from "../services/authSession";
export function useLeaveKitchen(): LeaveKitchenControls {
 const navigate = useNavigate();
 const [state, setState] = useState<{ saving: boolean; error: string | null }>({ saving: false, error: null });
 async function leave(): Promise<void> {
  setState({ saving: true, error: null });
  try { const user = await leaveCurrentKitchen(); updateSessionUser(user); setState({ saving: false, error: null }); navigate("/cozinha", { replace: true }); }
  catch(error) { setState({ saving: false, error: error instanceof Error ? error.message : "Não foi possível sair da cozinha." }); }
 }
 return { ...state, leave };
}
