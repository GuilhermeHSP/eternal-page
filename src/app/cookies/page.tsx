import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/legal-page';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Quais cookies e dados de navegador o EternalPage usa, e como gerenciá-los.',
};

const sections: LegalSection[] = [
  {
    id: 'o-que-sao',
    title: 'O que são cookies',
    content: (
      <p>
        Cookies são pequenos arquivos que um site guarda no seu navegador. O armazenamento local (localStorage e
        sessionStorage) funciona de forma parecida: guarda pequenas informações no seu aparelho para que o site se
        lembre delas na próxima visita.
      </p>
    ),
  },
  {
    id: 'nossos',
    title: 'O que o EternalPage usa',
    content: (
      <>
        <p>
          O EternalPage <strong>não usa cookies de publicidade</strong>. Usamos o armazenamento local do navegador
          para facilitar o uso do site e, só se você aceitar, cookies de análise do Google Analytics:
        </p>
        <ul>
          <li>
            <strong>E-mail do pagamento</strong> (<code>ep_buyer_email</code>): guarda o e-mail que você digitou no
            pagamento, para não precisar digitá-lo de novo. Fica só no seu aparelho até você limpar os dados do
            navegador.
          </li>
          <li>
            <strong>Guia do editor</strong> (<code>eternalpage-tour-done</code>): lembra que você já viu as dicas do
            editor, para não mostrá-las toda vez.
          </li>
          <li>
            <strong>Escolha sobre cookies</strong> (<code>ep_analytics_consent</code>): lembra se você aceitou ou
            recusou os cookies de análise, para não perguntar de novo.
          </li>
          <li>
            <strong>Área administrativa</strong>: usada apenas pela equipe do EternalPage, guarda a sessão de acesso
            enquanto a aba estiver aberta.
          </li>
        </ul>
        <p>
          Essas informações são necessárias para o funcionamento do site, não identificam você para terceiros e não são
          usadas para publicidade.
        </p>
        <p>
          <strong>Google Analytics</strong> (<code>_ga</code> e <code>_ga_*</code>): se você clicar em
          &quot;Aceitar&quot; no aviso de cookies, o Google Analytics grava esses cookies para contar visitas e entender
          quais páginas e etapas da compra são usadas, de forma agregada. Se você recusar ou não responder, nenhum
          cookie de análise é gravado; o Google recebe apenas sinais anônimos, sem cookies, de que a página foi vista.
          Esses dados nunca são usados para anúncios.
        </p>
      </>
    ),
  },
  {
    id: 'terceiros',
    title: 'Serviços de terceiros',
    content: (
      <>
        <p>Alguns recursos dependem de serviços de outras empresas, que podem usar seus próprios cookies:</p>
        <ul>
          <li>
            <strong>Mercado Pago:</strong> ao pagar, você é levado ao ambiente do Mercado Pago, que usa cookies para
            segurança e prevenção a fraudes, conforme a política dele.
          </li>
          <li>
            <strong>YouTube:</strong> quando uma homenagem toca música por link do YouTube, o player do YouTube é
            carregado e pode gravar cookies do Google.
          </li>
          <li>
            <strong>Google Fonts:</strong> algumas fontes são carregadas dos servidores do Google, que recebem o
            endereço IP do seu aparelho para entregá-las.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'gerenciar',
    title: 'Como gerenciar',
    content: (
      <p>
        Você pode apagar ou bloquear cookies e dados de sites nas configurações do seu navegador (Chrome, Safari, Edge,
        Firefox e outros). Ao apagar os dados do site, o aviso de cookies aparece de novo e você pode mudar sua
        escolha. O site continua funcionando, mas você precisará digitar o e-mail novamente no pagamento e poderá ver
        as dicas do editor de novo.
      </p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças',
    content: (
      <p>
        Se um dia passarmos a usar cookies de publicidade, atualizaremos esta política e pediremos o seu consentimento
        antes de ativá-los. Dúvidas: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Veja também
        a <a href="/privacidade">Política de Privacidade</a>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de Cookies"
      intro={<p>Resumo: o EternalPage não rastreia você nem mostra anúncios. Aqui está tudo o que guardamos no seu navegador.</p>}
      sections={sections}
    />
  );
}
