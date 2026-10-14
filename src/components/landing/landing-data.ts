// Content for the landing page. The photographs are archival pictures from open collections,
// used only as examples of what a tribute can hold; none of them shows a customer.

export interface Occasion {
  templateId: string;
  label: string;
  title: (name: string) => string;
  phrase: string;
  when: string;
  photo: string;
  alt: string;
}

export const OCCASIONS: Occasion[] = [
  {
    templateId: 'mothersDay',
    label: 'Mãe',
    title: (name) => `Para ${name}, que cuidou de tudo`,
    phrase: 'A melhor mãe do mundo',
    when: '2º domingo de maio',
    photo: '/acervo/vestido-floral.jpg',
    alt: 'Mulher de vestido florido em frente a uma casa, fotografia dos anos 1940',
  },
  {
    templateId: 'fathersDay',
    label: 'Pai',
    title: (name) => `Para ${name}, meu primeiro herói`,
    phrase: 'Meu primeiro herói',
    when: '2º domingo de agosto',
    photo: '/acervo/pai-1947.jpg',
    alt: 'Pai em pé no jardim ao lado do filho pequeno, fotografia de 1947',
  },
  {
    templateId: 'romantic',
    label: 'Amor',
    title: (name) => `Para ${name}, com todo o meu amor`,
    phrase: 'Com todo o meu amor',
    when: 'Qualquer dia do ano',
    photo: '/acervo/casal-harpa.jpg',
    alt: 'Casal em casa, ela tocando harpa e ele ao lado, fotografia antiga em cores',
  },
  {
    templateId: 'birthday',
    label: 'Aniversário',
    title: (name) => `Feliz aniversário, ${name}`,
    phrase: 'Feliz aniversário',
    when: 'No dia dela ou dele',
    photo: '/acervo/retrato-1930.jpg',
    alt: 'Retrato de estúdio de uma jovem sorrindo, anos 1930',
  },
  {
    templateId: 'anniversary',
    label: 'Bodas',
    title: (name) => `${name}, cinquenta anos juntos`,
    phrase: 'Cinquenta anos juntos',
    when: 'De papel a ouro',
    photo: '/acervo/bodas-1932.jpg',
    alt: 'Casal de idosos sentados com flores no colo nas bodas de ouro, 1932',
  },
  {
    templateId: 'friendship',
    label: 'Amizade',
    title: (name) => `${name}, amiga de todas as horas`,
    phrase: 'Amiga de todas as horas',
    when: '20 de julho',
    photo: '/acervo/amigas-1940.jpg',
    alt: 'Duas amigas de chapéu sorrindo num dia de corrida de cavalos, 1940',
  },
];

export interface ShowcaseTab {
  label: string;
  title: string;
  description: string;
  photo: string;
  alt: string;
}

export const SHOWCASE: ShowcaseTab[] = [
  {
    label: 'Bodas',
    title: 'Cinquenta anos numa página',
    description:
      'Uma foto de abertura, a carta dos netos, doze fotos com legenda e a linha do tempo de 1882 a 1932. Quem recebe abre no celular, sem instalar nada.',
    photo: '/acervo/bodas-1932.jpg',
    alt: 'Casal de idosos sentados com flores no colo nas bodas de ouro, 1932',
  },
  {
    label: 'Dia das Mães',
    title: 'O vestido de domingo',
    description:
      'A foto preferida dela no topo, a mensagem dos filhos e uma galeria com as legendas que só a família entende. A música toca baixinho enquanto ela rola a página.',
    photo: '/acervo/vestido-floral.jpg',
    alt: 'Mulher de vestido florido em frente a uma casa, fotografia dos anos 1940',
  },
  {
    label: 'Família',
    title: 'A turma toda no jardim',
    description:
      'Uma página para o avô com a foto do almoço de 1942, os nomes de cada neto na legenda e uma linha do tempo com as casas onde a família morou.',
    photo: '/acervo/familia-1942.jpg',
    alt: 'Família reunida sentada na grama em frente a uma escada, 1942',
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

export const GALLERY: GalleryTile[] = [
  { templateId: 'mothersDay', name: 'Dia das Mães', when: 'Maio', detail: 'Mãe, avó, madrinha', photo: '/acervo/vestido-floral.jpg', alt: 'Mulher de vestido florido em frente a uma casa, anos 1940' },
  { templateId: 'fathersDay', name: 'Dia dos Pais', when: 'Agosto', detail: 'Pai, avô, padrasto', photo: '/acervo/pai-1947.jpg', alt: 'Pai e filho pequeno no jardim, 1947' },
  { templateId: 'romantic', name: 'Amor', when: 'Qualquer dia', detail: 'Para o casal', photo: '/acervo/casal-harpa.jpg', alt: 'Casal em casa, ela tocando harpa' },
  { templateId: 'valentine', name: 'Namorados', when: '12 de junho', detail: 'Para o casal', photo: '/acervo/casamento-1933.jpg', alt: 'Noivos sorrindo no carro depois do casamento, 1933' },
  { templateId: 'birthday', name: 'Aniversário', when: 'O dia certo', detail: 'Qualquer idade', photo: '/acervo/retrato-1930.jpg', alt: 'Retrato de estúdio de uma jovem sorrindo, anos 1930' },
  { templateId: 'anniversary', name: 'Bodas', when: 'Papel a ouro', detail: 'Anos de casados', photo: '/acervo/bodas-1932.jpg', alt: 'Casal de idosos nas bodas de ouro, 1932' },
  { templateId: 'friendship', name: 'Amizade', when: '20 de julho', detail: 'Amigas e amigos', photo: '/acervo/amigas-1940.jpg', alt: 'Duas amigas de chapéu num dia de corrida de cavalos, 1940' },
  { templateId: 'memorial', name: 'Memória', when: 'Para lembrar', detail: 'Quem partiu', photo: '/acervo/bodas-1940.jpg', alt: 'Casal de idosos sentados lado a lado em casa, 1940' },
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
      { what: 'Pagar uma vez para publicar', value: 'R$ 29,90+' },
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
    q: 'Quem recebe precisa criar conta?',
    a: 'Não. A pessoa abre o link no celular ou no computador, como qualquer site, sem baixar aplicativo.',
  },
  {
    q: 'Por quanto tempo a página fica no ar?',
    a: 'Depende do pacote: 30 dias na Básica, um ano na Plus e para sempre na Premium.',
  },
  {
    q: 'Posso mudar alguma coisa antes de publicar?',
    a: 'Pode, quantas vezes quiser. Da prévia você volta ao editor, troca fotos, textos e o modelo.',
  },
  {
    q: 'Quantas fotos cabem?',
    a: 'Até 3 na Básica, até 10 na Plus e sem limite na Premium.',
  },
  {
    q: 'Dá para colocar música?',
    a: 'Sim, nos pacotes Plus e Premium. Você envia um arquivo de áudio ou cola o link da música.',
  },
  {
    q: 'Como eu entrego o presente?',
    a: 'Você recebe um endereço único e difícil de adivinhar, e manda por WhatsApp, e-mail ou num cartão impresso.',
  },
];

export const CREDITS = [
  { file: 'vestido-floral.jpg', text: '“Woman in floral dress”, Nic Dafis, CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Woman_in_floral_dress.jpg' },
  { file: 'pai-1947.jpg', text: '“My father and me”, W. A. Balk, CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:My_father_and_me.jpg' },
  { file: 'casal-harpa.jpg', text: '“Marcelle et Robert de Lacour”, CC0', href: 'https://commons.wikimedia.org/w/index.php?curid=12336261' },
  { file: 'casamento-1933.jpg', text: '“Happy couple after their wedding in Brisbane”, State Library of Queensland, sem restrições conhecidas', href: 'https://commons.wikimedia.org/wiki/File:Happy_couple_after_their_wedding_in_Brisbane_(4460984873).jpg' },
  { file: 'retrato-1930.jpg', text: '“1930s portrait (1)”, Jennifer Boyer, CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:1930s_portrait_(1).jpg' },
  { file: 'bodas-1932.jpg', text: '“Augusta & Ola Svensson 1932”, domínio público', href: 'https://commons.wikimedia.org/wiki/File:Augusta_%26_Ola_Svensson_1932.jpg' },
  { file: 'amigas-1940.jpg', text: '“Two ladies enjoying a day out at the races”, State Library of Queensland, sem restrições conhecidas', href: 'https://commons.wikimedia.org/wiki/File:Two_ladies_enjoying_a_day_out_at_the_races,_Ascot_racetrack,_Brisbane_(4903103411).jpg' },
  { file: 'bodas-1940.jpg', text: '“Golden Wedding anniversary of Montgomeryshire couple”, Geoff Charles, CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Golden_Wedding_anniversary_of_Montgomeryshire_couple_(1454788).jpg' },
  { file: 'familia-1942.jpg', text: '“W.D Hogan and friends at the Keany’s house”, National Library of Ireland, sem restrições conhecidas', href: 'https://commons.wikimedia.org/wiki/File:W.D_Hogan_and_friends_at_the_Keany%27s_house,_Westbrook,_Dundrum_(34843521636).jpg' },
];


// A complete example tribute, shown in the phone on the landing page. Its photos are
// archival examples, not a customer's.
export const DEMO_CONFIG = {
  title: 'A melhor avó do mundo',
  recipient: 'Helena',
  template: 'mothersDay',
  authorName: 'seus netos',
  hero: { image: '/acervo/retrato-1930.jpg', overlay: true },
  message: {
    text:
      'Vó, obrigado por **cada domingo** na sua cozinha, pelas histórias antes de dormir e pelo colo que nunca faltou. Esta página guarda um pouco de tudo o que você construiu.',
    typingAnimation: false,
  },
  counter: { date: '1938-05-14', label: 'Juntos há' },
  reasons: ['O cheiro de bolo de fubá aos domingos', 'As histórias da sua infância na roça', 'O colo que nunca faltou', 'Seu jeito de rir de tudo', 'Os bilhetes na lancheira', 'Ensinar a gente a perdoar'],
  gallery: [
    { id: 'g1', url: '/acervo/familia-1942.jpg', caption: 'O almoço de 1942', order: 0 },
    { id: 'g2', url: '/acervo/vestido-floral.jpg', caption: 'O vestido de domingo', order: 1 },
    { id: 'g3', url: '/acervo/bodas-1940.jpg', caption: 'Cinquenta anos juntos', order: 2 },
  ],
  timeline: [
    { id: 't1', year: '1938', title: 'O casamento', description: 'Na igrejinha da vila, num sábado de chuva.', order: 0 },
    { id: 't2', year: '1942', title: 'A casa cheia', description: 'Os primeiros netos chegam para o almoço.', order: 1 },
    { id: 't3', year: '1988', title: 'Bodas de ouro', description: 'A família inteira reunida no quintal.', order: 2 },
  ],
  closingMessage: 'Você é a raiz de tudo o que somos. Te amamos, vó.',
};
