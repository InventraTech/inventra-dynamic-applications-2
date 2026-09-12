import AppRoutes from "./routes/AppRoutes";

import { AccessibilityProvider } from "./context/AccessibilityContext";

function App() {
  return (
    <AccessibilityProvider>
      <AppRoutes />
    </AccessibilityProvider>
  )
}

export default App;