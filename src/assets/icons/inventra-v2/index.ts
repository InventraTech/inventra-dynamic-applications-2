import alertasVisuais from "./alertas-visuais.svg";
import altoContraste from "./alto-contraste.svg";
import adicionar from "./adicionar.svg";
import alerta from "./alerta.svg";
import busca from "./busca.svg";
import carrinho from "./carrinho.svg";
import config from "./config.svg";
import conta from "./conta.svg";
import controleVoz from "./controle-voz.svg";
import cursorAmpliado from "./cursor-ampliado.svg";
import daltonismo from "./daltonismo.svg";
import editar from "./editar.svg";
import erro from "./erro.svg";
import espacamentoTexto from "./espacamento-texto.svg";
import excluir from "./excluir.svg";
import eyeTracking from "./eye-tracking.svg";
import favorito from "./favorito.svg";
import focoTeclado from "./foco-teclado.svg";
import fornecedor from "./fornecedor.svg";
import fonteDislexia from "./fonte-dislexia.svg";
import historico from "./historico.svg";
import statusInfo from "./status-info.svg";
import leituraVoz from "./leitura-voz.svg";
import notificacao from "./notificacao.svg";
import ordenar from "./ordenar.svg";
import preLista from "./pre-lista.svg";
import produtosMaca from "./produtos-maca.svg";
import reguaLeitura from "./regua-leitura.svg";
import requisicao from "./requisicao.svg";
import reduzirAnimacoes from "./reduzir-animacoes.svg";
import registerAccount from "./register-account.svg";
import registerInvite from "./register-invite.svg";
import registerKitchen from "./register-kitchen.svg";
import scanner from "./scanner.svg";
import sucesso from "./sucesso.svg";
import supervisor from "./supervisor.svg";
import tamanhoFonte from "./tamanho-fonte.svg";
import estoque from "./estoque.svg";
import filtro from "./filtro.svg";
import vlibras from "./vlibras.svg";
import vencimento from "./vencimento.svg";

export const inventraIcons = {
    alertasVisuais,
    altoContraste,
    adicionar,
    alerta,
    busca,
    carrinho,
    config,
    conta,
    controleVoz,
    cursorAmpliado,
    daltonismo,
    editar,
    erro,
    espacamentoTexto,
    excluir,
    eyeTracking,
    favorito,
    focoTeclado,
    fornecedor,
    fonteDislexia,
    historico,
    statusInfo,
    leituraVoz,
    notificacao,
    ordenar,
    preLista,
    produtosMaca,
    reguaLeitura,
    requisicao,
    reduzirAnimacoes,
    registerAccount,
    registerInvite,
    registerKitchen,
    scanner,
    sucesso,
    supervisor,
    tamanhoFonte,
    estoque,
    filtro,
    vlibras,
    vencimento,
} as const;

export type InventraIconName = keyof typeof inventraIcons;
