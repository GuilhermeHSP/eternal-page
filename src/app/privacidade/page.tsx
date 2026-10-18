import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/legal-page';
import { COMPANY, companyIdentity } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como o EternalPage coleta, usa, guarda e protege dados pessoais, de acordo com a LGPD.',
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;
const dpoMail = <a href={`mailto:${COMPANY.dpoEmail}`}>{COMPANY.dpoEmail}</a>;

const sections: LegalSection[] = [
  {
    id: 'controlador',
    title: 'Quem cuida dos seus dados',
    content: (
      <>
        <p>
          O controlador dos dados pessoais tratados no EternalPage é <strong>{companyIdentity()}</strong>
          {COMPANY.address && <>, com endereço em {COMPANY.address}</>}.
        </p>
        <p>
          Nosso encarregado pelo tratamento de dados pessoais (LGPD, art. 41)
          {COMPANY.dpoName && <> é {COMPANY.dpoName} e</>} pode ser contatado pelo e-mail {dpoMail}.
        </p>
      </>
    ),
  },
  {
    id: 'dados',
    title: 'Quais dados coletamos',
    content: (
      <>
        <p>Coletamos apenas o necessário para criar, entregar e manter as homenagens:</p>
        <ul>
          <li>
            <strong>Conteúdo da homenagem:</strong> nome de quem é homenageado e de quem assina, título, textos, carta,
            datas, momentos da linha do tempo, motivos, fotos, mensagem de voz gravada, música enviada ou link de
            música, e as escolhas de modelo e cores.
          </li>
          <li>
            <strong>Dados da compra:</strong> o e-mail informado no pagamento, o pacote escolhido, valor, cupom usado,
            data e o status e número de identificação do pagamento informados pelo Mercado Pago.
          </li>
          <li>
            <strong>Mural de recados:</strong> nome e mensagem de quem deixa um recado em uma homenagem.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, data e hora de acesso, tipo de navegador e dispositivo,
            registrados pelos servidores, e uma contagem de visualizações de cada página, sem identificar quem visitou.
          </li>
        </ul>
        <p>
          <strong>Não recebemos</strong> número de cartão, CVV, senha ou dados bancários: eles são informados
          diretamente no ambiente do Mercado Pago. Não pedimos CPF, endereço, data de nascimento nem criação de conta.
        </p>
        <p>
          As fotos e textos da homenagem podem conter dados de outras pessoas, como o homenageado, familiares ou
          crianças. Quem cria a homenagem declara ter autorização dessas pessoas (e dos pais ou responsáveis, no caso
          de crianças e adolescentes) para incluí-las, como previsto nos <a href="/termos">Termos de Uso</a>.
        </p>
      </>
    ),
  },
  {
    id: 'finalidades',
    title: 'Para que usamos e com qual base legal',
    content: (
      <ul>
        <li>
          <strong>Montar, mostrar a prévia e publicar a homenagem</strong>, guardar as fotos e áudios e exibir a
          página a quem tem o link: execução do contrato (LGPD, art. 7º, V).
        </li>
        <li>
          <strong>Processar o pagamento</strong> e enviar o link, o QR code e avisos sobre a sua compra por e-mail:
          execução do contrato (art. 7º, V).
        </li>
        <li>
          <strong>Atender pedidos de suporte, reembolso e exercício de direitos</strong>: execução do contrato e
          cumprimento de obrigação legal (art. 7º, II e V).
        </li>
        <li>
          <strong>Guardar registros de pagamento e de acesso</strong> exigidos pela legislação fiscal, de defesa do
          consumidor e pelo Marco Civil da Internet: cumprimento de obrigação legal (art. 7º, II).
        </li>
        <li>
          <strong>Proteger o serviço</strong> contra fraudes, spam no mural e uso indevido, e defender direitos em
          processos: legítimo interesse e exercício regular de direitos (art. 7º, VI e IX).
        </li>
      </ul>
    ),
  },
  {
    id: 'nao-fazemos',
    title: 'O que não fazemos',
    content: (
      <ul>
        <li>Não vendemos nem alugamos dados pessoais.</li>
        <li>Não usamos fotos, textos ou áudios das homenagens em anúncios ou divulgação sem autorização expressa.</li>
        <li>Não enviamos e-mails de propaganda sem o seu consentimento; os e-mails que mandamos são sobre a sua compra.</li>
        <li>Não usamos cookies de publicidade nem ferramentas de rastreamento de terceiros no site.</li>
      </ul>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    content: (
      <>
        <p>Compartilhamos dados apenas com fornecedores que nos ajudam a prestar o serviço, e só o necessário:</p>
        <ul>
          <li>
            <strong>Mercado Pago</strong>, para processar o pagamento. Ele trata os seus dados de pagamento conforme a
            política de privacidade dele.
          </li>
          <li>
            <strong>Cloudflare (R2)</strong>, onde ficam guardadas as fotos, músicas e mensagens de voz.
          </li>
          <li><strong>Resend</strong>, que envia os e-mails com o link e o QR code da homenagem.</li>
          <li>O provedor de hospedagem do site e do banco de dados.</li>
          <li>
            <strong>YouTube (Google)</strong>, quando a homenagem toca uma música por link do YouTube: o player é
            carregado do próprio YouTube no aparelho de quem visita.
          </li>
          <li>Autoridades públicas e Judiciário, quando houver obrigação legal ou ordem judicial.</li>
        </ul>
        <p>
          Lembre-se de que o conteúdo da homenagem, depois de publicada, é visto por todos que tiverem o link, assim
          como os recados do mural, quando ele estiver aberto.
        </p>
      </>
    ),
  },
  {
    id: 'internacional',
    title: 'Transferência internacional',
    content: (
      <p>
        Alguns desses fornecedores (como Cloudflare, Resend e Google) podem armazenar ou processar dados em servidores
        fora do Brasil. Nesses casos, a transferência é feita para a execução do contrato com você e com fornecedores
        que adotam garantias de proteção compatíveis com a LGPD (art. 33).
      </p>
    ),
  },
  {
    id: 'retencao',
    title: 'Por quanto tempo guardamos',
    content: (
      <ul>
        <li>
          <strong>Homenagens publicadas:</strong> enquanto a página estiver no ar. No pacote Básico, depois do
          vencimento de 1 ano, o conteúdo pode ser excluído.
        </li>
        <li>
          <strong>Rascunhos não pagos:</strong> guardados para que você possa voltar a editar, e podem ser excluídos
          depois de um período sem atividade.
        </li>
        <li>
          <strong>Registros de pagamento:</strong> pelo prazo exigido pela legislação fiscal e de defesa do consumidor
          (em geral, 5 anos), mesmo depois da exclusão da página.
        </li>
        <li>
          <strong>Registros de acesso:</strong> por 6 meses, como determina o Marco Civil da Internet (art. 15).
        </li>
      </ul>
    ),
  },
  {
    id: 'seguranca',
    title: 'Como protegemos',
    content: (
      <>
        <p>
          O site usa conexão criptografada (HTTPS). Cada homenagem recebe um endereço gerado ao acaso, difícil de
          adivinhar, e pedimos aos buscadores que não a indexem. O acesso à área administrativa é restrito e protegido
          por senha, e os pagamentos acontecem no ambiente do Mercado Pago.
        </p>
        <p>
          Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente de segurança que possa trazer risco ou
          dano relevante, avisaremos as pessoas afetadas e a Autoridade Nacional de Proteção de Dados (ANPD), como
          exige a lei.
        </p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    content: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados e cópia das fotos, textos e áudios que você enviou;</li>
          <li>eliminação dos dados, incluindo a exclusão da homenagem, ressalvados os registros que a lei nos obriga a guardar;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>revisão de decisões tomadas apenas de forma automatizada, se houver.</li>
        </ul>
        <p>
          Para isso, escreva para {dpoMail}, de preferência a partir do e-mail usado na compra e com o link da
          homenagem. Podemos pedir uma confirmação para ter certeza de que o pedido é seu. Respondemos em até 15 dias.
          Se a sua foto ou o seu nome aparece em uma homenagem criada por outra pessoa, você também pode pedir a
          remoção pelo mesmo e-mail.
        </p>
        <p>
          Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD), em{' '}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">gov.br/anpd</a>.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e armazenamento no navegador',
    content: (
      <p>
        O EternalPage não usa cookies de publicidade ou rastreamento. Guardamos no seu navegador apenas pequenas
        informações para facilitar o uso, como o e-mail digitado no pagamento. Veja os detalhes na{' '}
        <a href="/cookies">Política de Cookies</a>.
      </p>
    ),
  },
  {
    id: 'menores',
    title: 'Crianças e adolescentes',
    content: (
      <p>
        O EternalPage não é direcionado a menores de 18 anos, e a compra deve ser feita por um adulto. Fotos e nomes de
        crianças e adolescentes só podem ser incluídos em uma homenagem com autorização de um dos pais ou do
        responsável legal, e sempre no melhor interesse deles (LGPD, art. 14).
      </p>
    ),
  },
  {
    id: 'alteracoes',
    title: 'Mudanças nesta política',
    content: (
      <p>
        Podemos atualizar esta política para refletir mudanças no serviço, nos fornecedores ou na lei. A data da última
        atualização fica no topo da página, e mudanças importantes serão avisadas no site ou por e-mail.
      </p>
    ),
  },
  {
    id: 'contato',
    title: 'Contato',
    content: (
      <p>
        Dúvidas sobre privacidade: {dpoMail}. Outros assuntos: {mail}.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      intro={
        <p>
          Uma homenagem guarda memórias importantes, e cuidamos delas com o mesmo carinho. Esta política explica, de
          acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), quais dados o EternalPage coleta, para que os
          usa, com quem os compartilha e como você pode exercer seus direitos.
        </p>
      }
      sections={sections}
    />
  );
}
