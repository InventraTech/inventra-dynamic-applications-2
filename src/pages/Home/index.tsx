import { useState } from "react";
import Loading from "../../components/ui/Loading";
import Toggle from "../../components/ui/Toggle";

function Home() {
  const [falso, setFalso] = useState<boolean>(false);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Loading loadingText="Carregando..."/>
      <Toggle enabled={falso} onToggle={() => setFalso(!falso)} ariaLabel="oi"/>
    </main>
  )
}

export default Home;
