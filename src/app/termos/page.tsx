import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/legal-page';
import { COMPANY, companyIdentity } from '@/lib/legal';
import { PACKAGES, formatPrice } from '@/lib/packages';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Regras de uso do EternalPage: criação, pagamento, validade das páginas, reembolso e conteúdo.',
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const sections: LegalSection[] = [
  {
    id: 'aceitacao',
    title: 'Sobre estes termos',
    content: (
      <>
        <p>
          Estes Termos de Uso regem o uso do site EternalPage, mantido por <strong>{companyIdentity()}</strong>
          {COMPANY.city && <>, com sede em {COMPANY.city}</>}. Ao criar uma homenagem, pagar por ela, visitar uma
          página publicada ou deixar um recado, você concorda com estes termos e com a{' '}
          <a href="/privacidade">Política de Privacidade</a>.
        </p>
        <p>
          Se não concordar com alguma regra, não use o serviço. Em caso de dúvida, fale com a gente pelo e-mail {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'servico',
    title: 'O que o EternalPage oferece',
    content: (
      <>
        <p>
          O EternalPage permite montar uma página de homenagem com fotos, textos, linha do tempo, contador, mural de
          recados e, conforme o pacote, música e mensagem de voz. A página é publicada em um endereço próprio, que
          você pode enviar a quem quiser presentear.
        </p>
        <ul>
          <li>Montar a página e ver a prévia é gratuito.</li>
          <li>A publicação só acontece depois que o pagamento é confirmado.</li>
          <li>Quem recebe a homenagem não precisa criar conta nem instalar aplicativo.</li>
        </ul>
        <p>
          O serviço é destinado a maiores de 18 anos. Menores de idade só podem contratar com a participação de um
          responsável legal.
        </p>
      </>
    ),
  },
  {
    id: 'pagamento',
    title: 'Pacotes, preços e pagamento',
    content: (
      <>
        <p>
          Os pacotes disponíveis, o que cada um inclui e seus preços são os exibidos no site no momento da compra
          (hoje, {PACKAGES.basic.displayName} por {formatPrice(PACKAGES.basic.price)} e{' '}
          {PACKAGES.premium.displayName} por {formatPrice(PACKAGES.premium.price)}). O pagamento é único, sem
          assinatura e sem cobrança recorrente.
        </p>
        <p>
          Os pagamentos são processados pelo <strong>Mercado Pago</strong>, por Pix ou cartão, em ambiente do próprio
          Mercado Pago. O EternalPage não recebe nem armazena número de cartão ou senha bancária. As condições de
          parcelamento, tarifas e aprovação são definidas pelo Mercado Pago e pelo emissor do cartão.
        </p>
        <p>
          Cupons de desconto valem nas condições informadas na divulgação e podem ser encerrados a
          qualquer momento, sem afetar compras já feitas. Podemos alterar preços e pacotes para novas compras; quem
          já pagou mantém o que contratou.
        </p>
        <p>
          Depois da confirmação do pagamento, a página é publicada e enviamos o link e o QR code para o e-mail
          informado na compra. Confira o e-mail antes de pagar: é por ele que entramos em contato.
        </p>
      </>
    ),
  },
  {
    id: 'validade',
    title: 'Por quanto tempo a página fica no ar',
    content: (
      <>
        <ul>
          <li>
            <strong>Básico:</strong> a página fica disponível por 1 (um) ano, contado a partir da confirmação do
            pagamento. Depois desse prazo, o endereço passa a mostrar um aviso de que a homenagem expirou, e o
            conteúdo pode ser excluído.
          </li>
          <li>
            <strong>Completo:</strong> a página fica disponível por tempo indeterminado (&ldquo;para sempre&rdquo;),
            enquanto o EternalPage estiver em operação.
          </li>
        </ul>
        <p>
          Se um dia o serviço for encerrado, avisaremos pelo e-mail da compra com pelo menos 90 (noventa) dias de
          antecedência, para que você possa salvar suas fotos, textos e áudios.
        </p>
      </>
    ),
  },
  {
    id: 'reembolso',
    title: 'Arrependimento e reembolso',
    content: (
      <>
        <p>
          Como a compra é feita pela internet, você pode desistir dela em até <strong>7 (sete) dias</strong> contados
          do pagamento, conforme o artigo 49 do Código de Defesa do Consumidor. Basta escrever para {mail} a partir do
          e-mail usado na compra, informando o link da homenagem.
        </p>
        <p>
          O valor é devolvido integralmente pelo mesmo meio de pagamento, por meio do Mercado Pago, e a página é
          retirada do ar. O prazo para o valor aparecer na sua conta ou fatura depende do Mercado Pago e do emissor
          do cartão.
        </p>
        <p>
          Fora desse prazo, também devolvemos o valor se a página não puder ser publicada ou ficar indisponível por
          falha nossa que não seja corrigida em tempo razoável. Não há reembolso quando a página for retirada do ar
          por violação destes termos.
        </p>
      </>
    ),
  },
  {
    id: 'conteudo',
    title: 'O conteúdo que você envia',
    content: (
      <>
        <p>
          As fotos, textos, áudios e links que você coloca na homenagem continuam sendo seus. Você é o único
          responsável por eles e declara que:
        </p>
        <ul>
          <li>tem o direito de usar cada foto, música e áudio enviado, ou autorização de quem tem;</li>
          <li>
            tem autorização das pessoas que aparecem nas fotos ou são citadas na página e, no caso de crianças e
            adolescentes, de um dos pais ou responsável;
          </li>
          <li>o conteúdo não viola a lei nem direitos de terceiros.</li>
        </ul>
        <p>Não é permitido publicar conteúdo que:</p>
        <ul>
          <li>seja ilegal, difamatório, discriminatório, violento, de ódio ou que incentive crimes;</li>
          <li>tenha nudez, conteúdo sexual ou qualquer conteúdo sexual envolvendo menores;</li>
          <li>exponha dados pessoais de terceiros sem autorização, como documentos, endereços ou telefones;</li>
          <li>seja usado para assediar, ameaçar, enganar ou aplicar golpes;</li>
          <li>infrinja direitos autorais, de marca ou de imagem.</li>
        </ul>
        <p>
          Para publicar a página, você nos concede uma autorização gratuita, não exclusiva e limitada para armazenar,
          adaptar (por exemplo, redimensionar fotos) e exibir esse conteúdo a quem tiver o link, apenas para prestar o
          serviço. Essa autorização termina quando o conteúdo é excluído. Não usamos suas fotos em anúncios ou
          divulgação sem a sua autorização expressa.
        </p>
      </>
    ),
  },
  {
    id: 'mural',
    title: 'Mural de recados',
    content: (
      <>
        <p>
          Quem cria a homenagem decide se o mural de recados fica aberto. Com o mural aberto, qualquer pessoa com o
          link pode ler os recados e deixar o seu, com nome e mensagem.
        </p>
        <p>
          Cada pessoa é responsável pelo recado que escreve. Podemos limitar envios em sequência e remover recados que
          violem estes termos, inclusive a pedido de quem criou a homenagem ou de quem foi homenageado.
        </p>
      </>
    ),
  },
  {
    id: 'link',
    title: 'Quem pode ver a página',
    content: (
      <>
        <p>
          Cada homenagem tem um endereço gerado ao acaso e difícil de adivinhar, e pedimos aos buscadores que não a
          incluam em resultados de pesquisa. Ainda assim, <strong>qualquer pessoa que tiver o link consegue abrir a
          página</strong>. Compartilhe o link apenas com quem você quer que veja, e não coloque na homenagem nada que
          não possa ser visto por essas pessoas.
        </p>
      </>
    ),
  },
  {
    id: 'remocao',
    title: 'Denúncias e remoção de conteúdo',
    content: (
      <>
        <p>
          Se você encontrar uma página ou recado que viole a lei, estes termos ou os seus direitos, escreva para {mail}
          com o link e o motivo. Analisaremos o pedido e poderemos remover o conteúdo ou suspender a página, avisando o
          responsável pelo e-mail da compra quando for possível.
        </p>
        <p>
          Também podemos retirar do ar, sem aviso prévio, conteúdo claramente ilegal ou que coloque pessoas em risco, e
          cumpriremos ordens judiciais e pedidos de autoridades nos termos da lei.
        </p>
      </>
    ),
  },
  {
    id: 'propriedade',
    title: 'Propriedade intelectual do EternalPage',
    content: (
      <p>
        A marca EternalPage, o logotipo, os modelos de página, o layout, as ilustrações, os textos do site e o código
        são protegidos pela Lei de Direitos Autorais (Lei 9.610/98) e pela Lei de Propriedade Industrial (Lei
        9.279/96). Você pode usar o serviço para criar e compartilhar suas homenagens, mas não pode copiar,
        reproduzir, revender ou criar serviços derivados a partir dele, nem extrair seu conteúdo de forma automatizada,
        sem autorização por escrito.
      </p>
    ),
  },
  {
    id: 'responsabilidade',
    title: 'Disponibilidade e responsabilidade',
    content: (
      <>
        <p>
          Trabalhamos para manter o site no ar e as homenagens acessíveis, mas o serviço depende de internet e de
          fornecedores (hospedagem, armazenamento de arquivos, e-mail e pagamento) e pode ter interrupções para
          manutenção ou por falhas fora do nosso controle.
        </p>
        <p>
          Músicas incluídas por link do YouTube dependem da disponibilidade do vídeo na plataforma; se o vídeo for
          removido ou bloqueado, a música deixa de tocar.
        </p>
        <p>
          Na medida permitida pela lei, o EternalPage não responde pelo conteúdo enviado por usuários, por recados de
          visitantes, por uso indevido do link por quem o recebeu nem por danos indiretos. Nada nestes termos limita
          os direitos garantidos a você pelo Código de Defesa do Consumidor.
        </p>
      </>
    ),
  },
  {
    id: 'alteracoes',
    title: 'Mudanças nestes termos',
    content: (
      <p>
        Podemos atualizar estes termos para refletir mudanças no serviço ou na lei. A data da última atualização fica
        no topo da página. Mudanças importantes serão avisadas no site ou por e-mail, e não reduzem o que você já
        contratou.
      </p>
    ),
  },
  {
    id: 'foro',
    title: 'Lei aplicável e foro',
    content: (
      <p>
        Estes termos seguem as leis brasileiras. Qualquer questão poderá ser levada ao foro do seu domicílio, como
        garante o Código de Defesa do Consumidor
        {COMPANY.forum ? <>, ou ao foro da comarca de {COMPANY.forum}</> : null}. Antes disso, procure a gente: a
        maioria dos problemas se resolve por e-mail.
      </p>
    ),
  },
  {
    id: 'contato',
    title: 'Contato',
    content: (
      <p>
        Dúvidas, pedidos de reembolso ou denúncias: {mail}. Veja também a página <a href="/contato">Fale conosco</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      intro={
        <p>
          Aqui estão as regras para criar, comprar e compartilhar homenagens no EternalPage. Escrevemos de forma
          direta para que fique fácil entender o que você pode esperar de nós e o que esperamos de você.
        </p>
      }
      sections={sections}
    />
  );
}
