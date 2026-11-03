import AppRoutes from "./routes/AppRoutes";

import { AccessibilityProvider } from "./context/AccessibilityContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppRoutes />
      </AccessibilityProvider>
    </AuthProvider>
  )
}

export default App;
