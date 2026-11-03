import type { PageDestination } from "../types/navigation";
export const pageDestinations: PageDestination[] = [
 { title: "Painel", path: "/dashboard", keywords: "dashboard métricas indicadores" },
 { title: "Requisições", path: "/requisicoes", roles: ["SUPERVISOR", "COMPRADOR"], keywords: "compras pedidos" },
 { title: "Estoque", path: "/estoque", keywords: "lotes validade entradas baixas consumo" },
 { title: "Inventários", path: "/inventarios", keywords: "contagem conferência" },
 { title: "Produtos", path: "/produtos", roles: ["SUPERVISOR"], keywords: "catálogo categorias unidades" },
 { title: "Fornecedores", path: "/fornecedores", keywords: "empresas" },
 { title: "Histórico", path: "/historico", keywords: "retiradas solicitações" },
 { title: "Cozinha", path: "/cozinha", keywords: "convite endereço" },
 { title: "Equipe e acessos", path: "/equipe-acessos", roles: ["SUPERVISOR"], keywords: "usuários colaboradores funcionários" },
 { title: "Configurações da conta", path: "/perfil", keywords: "perfil nome senha foto" },
 { title: "Acessibilidade", path: "/acessibilidade", keywords: "voz fonte contraste daltonismo" },
 { title: "Assistente IA", path: "/assistente-ia", keywords: "caixito inteligência artificial" },
];
export const normalizePageQuery = (value: string): string => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
export function searchPages(query: string, role: string): PageDestination[] {
 const words = normalizePageQuery(query).split(/\s+/).filter(Boolean);
 return pageDestinations.filter(page => (!page.roles || page.roles.includes(role.toUpperCase())) && words.every(word => normalizePageQuery(`${page.title} ${page.keywords ?? ""}`).includes(word)));
}
