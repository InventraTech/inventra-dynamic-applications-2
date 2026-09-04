// import Loading from "./components/Loading";
import Sidebar from "./components/Sidebar";
import type { MenuOptions } from "./components/Sidebar";
import logoInventra from "./assets/img/favicon.svg"

function App() {
  const options: MenuOptions[] = [
    {page: "Início", pageIcon: "", pagePath: "/"},
    {page: "Estoque", pageIcon: "", pagePath: "/estoque"},
    {page: "Cozinhas", pageIcon: "", pagePath: "/cozinhas"}
  ]

  return (
    <main className="bg-white">
      {/* <Loading loadingText="Carregando..."/> */}
      <Sidebar logo={logoInventra} menuOptions={options}/>
    </main>
  )
}

export default App;