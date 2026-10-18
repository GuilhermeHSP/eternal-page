// Content for the landing page. The photographs are free stock pictures (CC0), used only as
// examples of what a tribute can hold; none of them shows a customer.

import demoTribute from '../../../prisma/demo-tribute.json';

export interface Occasion {
  templateId: string;
  label: string;
  // The example name shown in the phone for this occasion.
  recipient: string;
  title: (name: string) => string;
  phrase: string;
  when: string;
  photo: string;
  alt: string;
}

// Amor comes first: it is the flagship occasion and the one the hero opens on.
export const OCCASIONS: Occasion[] = [
  {
    templateId: 'romantic',
    label: 'Amor',
    recipient: 'Ana',
    title: (name) => `Para ${name}, com todo o meu amor`,
    phrase: 'Com todo o meu amor',
    when: 'Qualquer dia do ano',
    photo: '/landing/amor.jpg',
    alt: 'Mulher de cabelos castanhos olhando para a câmera numa escada',
  },
  {
    templateId: 'mothersDay',
    label: 'Mãe',
    recipient: 'Maria',
    title: (name) => `Para ${name}, que cuidou de tudo`,
    phrase: 'A melhor mãe do mundo',
    when: '2º domingo de maio',
    photo: '/demo/mother-daughter.jpg',
    alt: 'Mãe abraçando a filha e sorrindo',
  },
  {
    templateId: 'fathersDay',
    label: 'Pai',
    recipient: 'José',
    title: (name) => `Para ${name}, meu primeiro herói`,
    phrase: 'Meu primeiro herói',
    when: '2º domingo de agosto',
    photo: '/landing/pai-jose.jpg',
    alt: 'Pai sorrindo com o filho pendurado nas suas costas num parque',
  },
  {
    templateId: 'birthday',
    label: 'Aniversário',
    recipient: 'Pedro',
    title: (name) => `Feliz aniversário, ${name}`,
    phrase: 'Feliz aniversário',
    when: 'No dia dela ou dele',
    photo: '/landing/aniversario-pedro.jpg',
    alt: 'Bolo de aniversário com velas acesas numa festa à noite',
  },
  {
    templateId: 'anniversary',
    label: 'Bodas',
    recipient: 'Rita e Renato',
    title: (name) => `${name}, uma vida juntos`,
    phrase: 'Uma vida juntos',
    when: 'De papel a ouro',
    photo: '/landing/bodas-rita-renato.jpg',
    alt: 'Casal de idosos abraçados e sorrindo',
  },
  {
    templateId: 'friendship',
    label: 'Amizade',
    recipient: 'Gabriela',
    title: (name) => `${name}, amiga de todas as horas`,
    phrase: 'Amiga de todas as horas',
    when: '20 de julho',
    photo: '/landing/amizade-gabriela.jpg',
    alt: 'Duas amigas abraçadas rindo ao fim da tarde',
  },
];

export interface GalleryTile {
  templateId: string;
  name: string;
  when: string;
  detail: string;
  photo: string;
  alt: string;
}

// The couple models lead the gallery, then the family and other dates.
export const GALLERY: GalleryTile[] = [
  { templateId: 'romantic', name: 'Amor', when: 'Qualquer dia', detail: 'Para o casal', photo: '/landing/amor.jpg', alt: 'Mulher de cabelos castanhos olhando para a câmera' },
  { templateId: 'valentine', name: 'Namorados', when: '12 de junho', detail: 'Para o casal', photo: '/landing/namorados-casal.jpg', alt: 'Casal sorrindo abraçado numa selfie' },
  { templateId: 'anniversary', name: 'Bodas', when: 'Papel a ouro', detail: 'Anos de casados', photo: '/landing/bodas-rita-renato.jpg', alt: 'Casal de idosos abraçados' },
  { templateId: 'mothersDay', name: 'Dia das Mães', when: 'Maio', detail: 'Mãe, avó, madrinha', photo: '/demo/mother-joy.jpg', alt: 'Mãe rindo com o bebê no colo' },
  { templateId: 'fathersDay', name: 'Dia dos Pais', when: 'Agosto', detail: 'Pai, avô, padrasto', photo: '/landing/pai-jose.jpg', alt: 'Pai sorrindo com o filho nas costas' },
  { templateId: 'birthday', name: 'Aniversário', when: 'O dia certo', detail: 'Qualquer idade', photo: '/landing/aniversario-pedro.jpg', alt: 'Bolo de aniversário com velas acesas' },
  { templateId: 'friendship', name: 'Amizade', when: '20 de julho', detail: 'Amigas e amigos', photo: '/landing/amizade-gabriela.jpg', alt: 'Duas amigas abraçadas rindo' },
  { templateId: 'memorial', name: 'Memória', when: 'Para lembrar', detail: 'Quem partiu', photo: '/landing/saudade.jpg', alt: 'Pai e filha caminhando de mãos dadas num bosque' },
];

export const STEPS = [
  {
    group: 'Agora',
    rows: [
      { what: 'Escolher a ocasião e o pacote', value: '1 min' },
      { what: 'Escrever o nome e a mensagem', value: '3 min' },
    ],
  },
  {
    group: 'Em seguida',
    rows: [
      { what: 'Subir as fotos com legenda', value: '4 min' },
      { what: 'Montar a linha do tempo', value: '2 min' },
      { what: 'Ver a prévia, ainda sem pagar', value: 'grátis' },
    ],
  },
  {
    group: 'No fim',
    rows: [
      { what: 'Pagar uma vez para publicar', value: 'R$ 18,90+' },
      { what: 'Copiar o link e enviar', value: 'na hora' },
    ],
  },
];

export const FAQ = [
  {
    q: 'Preciso pagar para começar?',
    a: 'Não. Você monta a página inteira e vê a prévia de graça. O pagamento só acontece quando você decide publicar.',
  },
  {
    q: 'E se eu não gostar depois de pagar?',
    a: 'Você tem 7 dias de garantia: é só escrever para o nosso e-mail com o link da homenagem e devolvemos 100% do valor pelo Mercado Pago.',
  },
  {
    q: 'Quem recebe precisa criar conta?',
    a: 'Não. A pessoa abre o link no celular ou no computador, como qualquer site, sem baixar aplicativo.',
  },
  {
    q: 'Por quanto tempo a página fica no ar?',
    a: 'No Básico, a página fica no ar por 1 ano. No Completo, para sempre.',
  },
  {
    q: 'Posso mudar alguma coisa antes de publicar?',
    a: 'Pode, quantas vezes quiser. Da prévia você volta ao editor, troca fotos, textos e o modelo.',
  },
  {
    q: 'Quantas fotos cabem?',
    a: 'Até 5 no Básico e até 30 no Completo.',
  },
  {
    q: 'Dá para colocar música?',
    a: 'Sim, no pacote Completo, que também permite gravar uma mensagem de voz. Você envia um arquivo de áudio ou cola o link da música.',
  },
  {
    q: 'Como eu entrego o presente?',
    a: 'Você recebe um endereço único e difícil de adivinhar, e manda por WhatsApp, e-mail ou num cartão impresso.',
  },
];

// The complete example tribute (Ana's page), shown in the phone on the landing page.
export const DEMO_CONFIG = demoTribute;
