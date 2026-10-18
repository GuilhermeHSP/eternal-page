import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/legal/legal-page';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Fale conosco',
  description: 'Como falar com o EternalPage: suporte, reembolso, privacidade e denúncias.',
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const sections: LegalSection[] = [
  {
    id: 'suporte',
    title: 'Dúvidas e suporte',
    content: (
      <>
        <p>
          Escreva para {mail}. Para agilizar, envie a mensagem a partir do e-mail usado na compra e inclua o link da
          homenagem (ou da prévia), além de um print se algo não estiver funcionando.
        </p>
        <p>Respondemos por ordem de chegada, normalmente em até 2 dias úteis.</p>
        <p>
          Muitas respostas já estão nas <a href="/#duvidas">perguntas frequentes</a>.
        </p>
      </>
    ),
  },
  {
    id: 'link',
    title: 'Não recebi o link',
    content: (
      <p>
        Depois da confirmação do pagamento, enviamos o link e o QR code para o e-mail informado na compra. Confira a
        caixa de spam e a aba Promoções. Pagamentos por cartão podem levar alguns minutos para ser aprovados. Se mesmo
        assim não chegar, escreva para {mail} com o e-mail da compra.
      </p>
    ),
  },
  {
    id: 'reembolso',
    title: 'Cancelamento e reembolso',
    content: (
      <p>
        Você pode desistir da compra em até 7 dias do pagamento e receber o valor de volta. Escreva para {mail} com o
        link da homenagem. Veja as condições nos <a href="/termos#reembolso">Termos de Uso</a>.
      </p>
    ),
  },
  {
    id: 'privacidade',
    title: 'Privacidade e seus dados',
    content: (
      <p>
        Para acessar, corrigir ou excluir seus dados, ou pedir a remoção de uma homenagem em que você aparece, escreva
        para <a href={`mailto:${COMPANY.dpoEmail}`}>{COMPANY.dpoEmail}</a>. Saiba mais na{' '}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>
    ),
  },
  {
    id: 'denuncia',
    title: 'Denunciar uma página ou recado',
    content: (
      <p>
        Se encontrar conteúdo ofensivo, ilegal ou que viole seus direitos, envie o link e o motivo para {mail}. Tratamos
        denúncias com prioridade.
      </p>
    ),
  },
];

export default function ContactPage() {
  return (
    <LegalPage
      title="Fale conosco"
      intro={
        <p>
          Estamos aqui para ajudar com a sua homenagem. Nosso atendimento é por e-mail: {mail}
        </p>
      }
      sections={sections}
      dated={false}
    />
  );
}
