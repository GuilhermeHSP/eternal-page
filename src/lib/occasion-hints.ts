// Example texts the creator shows for each occasion (placeholders, title suggestions and
// letter openings), so someone making a page for their love doesn't see "A melhor mãe do mundo!".

export interface OccasionHints {
  recipient: string;
  title: string;
  author: string;
  closing: string;
  counter: string;
  reasons: string[];
  titles: string[];
  letters: string[];
}

const LOVE: OccasionHints = {
  recipient: 'Ana',
  title: 'Para o amor da minha vida',
  author: 'Ex.: Lucas',
  closing: 'Te amo hoje e sempre...',
  counter: 'Juntos há',
  reasons: [
    'Seu sorriso que ilumina o meu dia',
    'O jeito como você me olha',
    'Seu abraço que resolve tudo',
    'Cada risada nossa no meio do nada',
  ],
  titles: ['Para o amor da minha vida', 'Feliz aniversário de namoro', 'Você é o meu lugar favorito'],
  letters: [
    'Ainda lembro do dia em que te conheci. Eu não sabia, mas ali começava a parte mais bonita da minha vida.\n\nObrigado por cada abraço, cada risada e cada dia ao seu lado.',
    'Para você, que transforma qualquer dia comum em especial.\n\nFiz esta página para guardar um pouquinho da nossa história e te lembrar, sempre que quiser, o quanto você é amada.',
  ],
};

const HINTS: Record<string, OccasionHints> = {
  romantic: LOVE,
  valentine: {
    ...LOVE,
    titles: ['Feliz Dia dos Namorados', 'Para o amor da minha vida', 'Meu presente é a nossa história'],
  },
  anniversary: {
    recipient: 'Rita e Renato',
    title: 'Uma vida juntos',
    author: 'Ex.: Seus filhos',
    closing: 'Que venham muitos anos mais...',
    counter: 'Casados há',
    reasons: [
      'O amor que vocês ensinaram pra gente',
      'As mãos dadas depois de tantos anos',
      'A casa sempre cheia',
      'O jeito como um cuida do outro',
    ],
    titles: ['Uma vida juntos', 'Feliz bodas!', 'Para sempre, vocês dois'],
    letters: [
      'Cada ano ao lado de vocês é uma prova de que o amor de verdade existe.\n\nObrigado por tudo que construíram e por nos ensinarem o que é família.',
    ],
  },
  mothersDay: {
    recipient: 'Maria',
    title: 'A melhor mãe do mundo!',
    author: 'Ex.: Raquel, ou Seus filhos',
    closing: 'Para sempre no meu coração...',
    counter: 'Sendo a melhor mãe do mundo há',
    reasons: [
      'Seu sorriso que ilumina o dia',
      'O jeito como você cuida de todos',
      'Seu abraço que resolve tudo',
      'Sua risada no meio do almoço',
    ],
    titles: ['A melhor mãe do mundo!', 'Para a minha rainha', 'Mãe, obrigado por tudo'],
    letters: [
      'Tudo o que eu sou começou com você. Obrigado por cada colo, cada conselho e cada vez que acreditou em mim.\n\nTe amo mais do que as palavras conseguem dizer.',
    ],
  },
  fathersDay: {
    recipient: 'José',
    title: 'O melhor pai do mundo!',
    author: 'Ex.: Pedro, ou Seus filhos',
    closing: 'Obrigado por tudo, pai...',
    counter: 'Sendo o melhor pai do mundo há',
    reasons: [
      'Seus conselhos na hora certa',
      'O jeito como você protege a família',
      'Suas piadas que só você acha graça',
      'Seu abraço apertado',
    ],
    titles: ['O melhor pai do mundo!', 'Meu herói', 'Pai, obrigado por tudo'],
    letters: [
      'Obrigado por me ensinar, com o exemplo, o que é ser forte e gentil ao mesmo tempo.\n\nTenho muito orgulho de ser seu filho.',
    ],
  },
  birthday: {
    recipient: 'Pedro',
    title: 'Feliz aniversário!',
    author: 'Ex.: Ana',
    closing: 'Que este ano seja incrível...',
    counter: 'Fazendo o mundo melhor há',
    reasons: [
      'Sua alegria que contagia todo mundo',
      'O jeito como você está sempre presente',
      'Suas histórias engraçadas',
      'Sua coragem para tudo',
    ],
    titles: ['Feliz aniversário!', 'Mais um ano de você', 'Hoje o dia é seu'],
    letters: [
      'Feliz aniversário!\n\nHoje é dia de comemorar você, e eu quis fazer algo diferente para mostrar o quanto você é especial.\n\nQue o seu novo ano seja tão incrível quanto você.',
    ],
  },
  friendship: {
    recipient: 'Gabriela',
    title: 'Para a minha melhor amiga',
    author: 'Ex.: Júlia',
    closing: 'Amigas para sempre...',
    counter: 'Amigas há',
    reasons: [
      'Você sempre sabe o que dizer',
      'Nossas risadas sem motivo',
      'Você está comigo em tudo',
      'Os segredos que só você sabe',
    ],
    titles: ['Para a minha melhor amiga', 'Amizade para a vida toda', 'Obrigada por existir'],
    letters: [
      'Não sei o que seria de mim sem você. Obrigada por cada conversa, cada conselho e cada risada que só a gente entende.\n\nVocê é família que eu escolhi.',
    ],
  },
  memorial: {
    recipient: 'Vó Lúcia',
    title: 'Saudade eterna',
    author: 'Ex.: Sua família',
    closing: 'Para sempre no nosso coração...',
    counter: 'Amando você há',
    reasons: [
      'Seu cheiro de casa',
      'As histórias que você contava',
      'O café da tarde com você',
      'Seu jeito de cuidar de todos',
    ],
    titles: ['Saudade eterna', 'Para sempre no nosso coração', 'Obrigado por tudo'],
    letters: [
      'Você continua presente em cada lembrança, em cada risada e em cada detalhe que nos ensinou.\n\nFizemos esta página para guardar um pouco de tudo o que você foi para nós.',
    ],
  },
};

export function hintsFor(templateId: string | undefined): OccasionHints {
  return (templateId && HINTS[templateId]) || LOVE;
}
