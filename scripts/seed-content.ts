/* eslint-disable @typescript-eslint/no-explicit-any */
// A0 course content seeding. Idempotent: safe to run multiple times.
// No delete operations — uses upsert / existence checks only.

type AnyPrisma = any;

interface VocabDef {
  dutch: string;
  wordType?: string;
  gender?: string;
  en: { translation: string; hint: string; example: string };
  pt: { translation: string; hint: string; example: string };
}

interface OptionDef {
  order: number;
  text: string;
  correct: boolean;
}

interface ExerciseDef {
  type: string;
  en: { question: string; instruction?: string; explanation?: string };
  pt: { question: string; instruction?: string; explanation?: string };
  options: OptionDef[];
}

interface LessonDef {
  code: string;
  sortOrder: number;
  isFree: boolean;
  xpReward: number;
  en: { title: string; description: string; objectives: string[] };
  pt: { title: string; description: string; objectives: string[] };
  vocab: VocabDef[];
  intro: { en: string; pt: string };
  exercises: ExerciseDef[];
}

interface ModuleDef {
  sortOrder: number;
  en: { title: string; description: string };
  pt: { title: string; description: string };
  lessons: LessonDef[];
}

const MODULES: ModuleDef[] = [
  {
    sortOrder: 1,
    en: {
      title: 'First Words & Greetings',
      description: 'Say hello, introduce yourself and be polite in Dutch.',
    },
    pt: {
      title: 'Primeiras Palavras e Sauda\u00e7\u00f5es',
      description: 'Diga ol\u00e1, apresente-se e seja educado em holand\u00eas.',
    },
    lessons: [
      {
        code: 'A0-01',
        sortOrder: 1,
        isFree: true,
        xpReward: 50,
        en: {
          title: 'Saying Hello',
          description: 'Your very first Dutch words: greetings for every moment of the day.',
          objectives: ['Greet people at different times of day', 'Say goodbye politely'],
        },
        pt: {
          title: 'Dizer Ol\u00e1',
          description: 'As suas primeiras palavras em holand\u00eas: sauda\u00e7\u00f5es para cada momento do dia.',
          objectives: ['Cumprimentar pessoas em diferentes alturas do dia', 'Despedir-se educadamente'],
        },
        intro: {
          en: 'In Dutch, greetings change with the time of day. Listen to the native audio for each word, then repeat out loud. The pronunciation aid below each word is only an approximation \u2014 always trust the audio.',
          pt: 'Em holand\u00eas, as sauda\u00e7\u00f5es mudam conforme a hora do dia. Ou\u00e7a o \u00e1udio nativo de cada palavra e depois repita em voz alta. O apoio de pron\u00fancia por baixo de cada palavra \u00e9 apenas uma aproxima\u00e7\u00e3o \u2014 confie sempre no \u00e1udio.',
        },
        vocab: [
          { dutch: 'hallo', wordType: 'interjection', en: { translation: 'hello', hint: 'HAH-loh', example: 'Hallo, hoe gaat het?' }, pt: { translation: 'ol\u00e1', hint: 'H\u00c1-l\u00f4', example: 'Hallo, hoe gaat het?' } },
          { dutch: 'goedemorgen', wordType: 'interjection', en: { translation: 'good morning', hint: 'KHOO-duh-MOR-khun', example: 'Goedemorgen! Alles goed?' }, pt: { translation: 'bom dia', hint: 'RRU-de-M\u00d3R-rren', example: 'Goedemorgen! Alles goed?' } },
          { dutch: 'goedenavond', wordType: 'interjection', en: { translation: 'good evening', hint: 'KHOO-dun-AH-vont', example: 'Goedenavond samen.' }, pt: { translation: 'boa noite (chegada)', hint: 'RRU-den-\u00c1-font', example: 'Goedenavond samen.' } },
          { dutch: 'dag', wordType: 'interjection', en: { translation: 'bye / hi', hint: 'DAKH', example: 'Dag! Tot morgen.' }, pt: { translation: 'ol\u00e1 / adeus', hint: 'DARR', example: 'Dag! Tot morgen.' } },
          { dutch: 'tot ziens', wordType: 'phrase', en: { translation: 'goodbye', hint: 'tot ZEENS', example: 'Tot ziens!' }, pt: { translation: 'adeus / at\u00e9 \u00e0 vista', hint: 'tot ZINS', example: 'Tot ziens!' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'Which word means "hello"?', instruction: 'Choose the correct word.', explanation: '"Hallo" is the most common all-purpose greeting.' },
            pt: { question: 'Que palavra significa "ol\u00e1"?', instruction: 'Escolha a palavra correta.', explanation: '"Hallo" \u00e9 a sauda\u00e7\u00e3o mais comum e vers\u00e1til.' },
            options: [
              { order: 1, text: 'hallo', correct: true },
              { order: 2, text: 'tot ziens', correct: false },
              { order: 3, text: 'dank je wel', correct: false },
              { order: 4, text: 'nee', correct: false },
            ],
          },
          {
            type: 'mcq',
            en: { question: 'How do you greet someone in the morning?', instruction: 'Choose the correct word.', explanation: '"Goedemorgen" = good morning.' },
            pt: { question: 'Como cumprimenta algu\u00e9m de manh\u00e3?', instruction: 'Escolha a palavra correta.', explanation: '"Goedemorgen" = bom dia.' },
            options: [
              { order: 1, text: 'goedenavond', correct: false },
              { order: 2, text: 'goedemorgen', correct: true },
              { order: 3, text: 'tot ziens', correct: false },
              { order: 4, text: 'dag', correct: false },
            ],
          },
          {
            type: 'true_false',
            en: { question: '"Tot ziens" is a way to say goodbye.', explanation: 'Correct \u2014 "tot ziens" means goodbye.' },
            pt: { question: '"Tot ziens" \u00e9 uma forma de dizer adeus.', explanation: 'Correto \u2014 "tot ziens" significa adeus.' },
            options: [
              { order: 1, text: 'true', correct: true },
              { order: 2, text: 'false', correct: false },
            ],
          },
        ],
      },
      {
        code: 'A0-02',
        sortOrder: 2,
        isFree: true,
        xpReward: 50,
        en: {
          title: 'Introducing Yourself',
          description: 'Say who you are and ask someone their name.',
          objectives: ['Say your name', 'Ask for someone\u2019s name', 'Respond when you meet someone'],
        },
        pt: {
          title: 'Apresentar-se',
          description: 'Diga quem \u00e9 e pergunte o nome a algu\u00e9m.',
          objectives: ['Dizer o seu nome', 'Perguntar o nome a algu\u00e9m', 'Responder ao conhecer algu\u00e9m'],
        },
        intro: {
          en: 'Now let\u2019s introduce ourselves. Notice how "ik" (I) and "jij" (you) work in simple sentences.',
          pt: 'Agora vamos apresentar-nos. Repare como "ik" (eu) e "jij" (tu/voc\u00ea) funcionam em frases simples.',
        },
        vocab: [
          { dutch: 'ik', wordType: 'pronoun', en: { translation: 'I', hint: 'ik', example: 'Ik ben Anna.' }, pt: { translation: 'eu', hint: 'ik', example: 'Ik ben Anna.' } },
          { dutch: 'ben', wordType: 'verb', en: { translation: 'am', hint: 'ben', example: 'Ik ben student.' }, pt: { translation: 'sou / estou', hint: 'ben', example: 'Ik ben student.' } },
          { dutch: 'mijn naam is', wordType: 'phrase', en: { translation: 'my name is', hint: 'mayn naam is', example: 'Mijn naam is Tom.' }, pt: { translation: 'o meu nome \u00e9', hint: 'main naam is', example: 'Mijn naam is Tom.' } },
          { dutch: 'jij', wordType: 'pronoun', en: { translation: 'you', hint: 'yay', example: 'En jij?' }, pt: { translation: 'tu / voc\u00ea', hint: 'iai', example: 'En jij?' } },
          { dutch: 'aangenaam', wordType: 'interjection', en: { translation: 'nice to meet you', hint: 'AHN-khuh-naam', example: 'Aangenaam!' }, pt: { translation: 'prazer em conhec\u00ea-lo', hint: '\u00c1N-rre-naam', example: 'Aangenaam!' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'How do you say "I" in Dutch?', instruction: 'Choose the correct word.', explanation: '"Ik" means "I".' },
            pt: { question: 'Como se diz "eu" em holand\u00eas?', instruction: 'Escolha a palavra correta.', explanation: '"Ik" significa "eu".' },
            options: [
              { order: 1, text: 'jij', correct: false },
              { order: 2, text: 'ik', correct: true },
              { order: 3, text: 'ben', correct: false },
              { order: 4, text: 'aangenaam', correct: false },
            ],
          },
          {
            type: 'word_order',
            en: { question: 'Build the sentence: "I am Anna."', instruction: 'Tap the words in the correct order.', explanation: 'Dutch word order here mirrors English: Ik / ben / Anna.' },
            pt: { question: 'Construa a frase: "Eu sou a Anna."', instruction: 'Toque nas palavras pela ordem correta.', explanation: 'A ordem \u00e9: Ik / ben / Anna.' },
            options: [
              { order: 1, text: 'Ik', correct: true },
              { order: 2, text: 'ben', correct: true },
              { order: 3, text: 'Anna', correct: true },
            ],
          },
          {
            type: 'fill_blank',
            en: { question: 'Complete: "Mijn ___ is Tom." (my name is Tom)', instruction: 'Type the missing word.', explanation: '"Mijn naam is Tom" = My name is Tom.' },
            pt: { question: 'Complete: "Mijn ___ is Tom." (o meu nome \u00e9 Tom)', instruction: 'Escreva a palavra em falta.', explanation: '"Mijn naam is Tom" = O meu nome \u00e9 Tom.' },
            options: [{ order: 1, text: 'naam', correct: true }],
          },
        ],
      },
      {
        code: 'A0-03',
        sortOrder: 3,
        isFree: false,
        xpReward: 60,
        en: {
          title: 'Please & Thank You',
          description: 'Be polite: please, thank you, yes and no.',
          objectives: ['Say please and thank you', 'Answer yes or no politely', 'Apologise'],
        },
        pt: {
          title: 'Por Favor e Obrigado',
          description: 'Seja educado: por favor, obrigado, sim e n\u00e3o.',
          objectives: ['Dizer por favor e obrigado', 'Responder sim ou n\u00e3o com educa\u00e7\u00e3o', 'Pedir desculpa'],
        },
        intro: {
          en: 'Politeness opens doors. These small words are used constantly in daily Dutch life.',
          pt: 'A educa\u00e7\u00e3o abre portas. Estas pequenas palavras s\u00e3o usadas constantemente no dia a dia holand\u00eas.',
        },
        vocab: [
          { dutch: 'alsjeblieft', wordType: 'interjection', en: { translation: 'please / here you go', hint: 'AL-shuh-bleeft', example: 'Koffie, alsjeblieft.' }, pt: { translation: 'por favor / aqui tem', hint: '\u00c1L-che-blift', example: 'Koffie, alsjeblieft.' } },
          { dutch: 'dank je wel', wordType: 'phrase', en: { translation: 'thank you', hint: 'DAHNK yuh vel', example: 'Dank je wel!' }, pt: { translation: 'obrigado', hint: 'DANK ie vel', example: 'Dank je wel!' } },
          { dutch: 'sorry', wordType: 'interjection', en: { translation: 'sorry', hint: 'SOR-ree', example: 'Sorry, ik begrijp het niet.' }, pt: { translation: 'desculpe', hint: 'S\u00d3-ri', example: 'Sorry, ik begrijp het niet.' } },
          { dutch: 'ja', wordType: 'adverb', en: { translation: 'yes', hint: 'yaa', example: 'Ja, graag.' }, pt: { translation: 'sim', hint: 'i\u00e1', example: 'Ja, graag.' } },
          { dutch: 'nee', wordType: 'adverb', en: { translation: 'no', hint: 'nay', example: 'Nee, dank je.' }, pt: { translation: 'n\u00e3o', hint: 'n\u00e9i', example: 'Nee, dank je.' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'Which word means "thank you"?', instruction: 'Choose the correct word.', explanation: '"Dank je wel" = thank you.' },
            pt: { question: 'Que express\u00e3o significa "obrigado"?', instruction: 'Escolha a op\u00e7\u00e3o correta.', explanation: '"Dank je wel" = obrigado.' },
            options: [
              { order: 1, text: 'alsjeblieft', correct: false },
              { order: 2, text: 'dank je wel', correct: true },
              { order: 3, text: 'sorry', correct: false },
              { order: 4, text: 'nee', correct: false },
            ],
          },
          {
            type: 'match_pairs',
            en: { question: 'Match each Dutch word to its meaning.', instruction: 'Match the pairs.', explanation: 'ja = yes, nee = no.' },
            pt: { question: 'Associe cada palavra ao seu significado.', instruction: 'Associe os pares.', explanation: 'ja = sim, nee = n\u00e3o.' },
            options: [
              { order: 1, text: 'ja|yes', correct: true },
              { order: 2, text: 'nee|no', correct: true },
              { order: 3, text: 'sorry|sorry', correct: true },
            ],
          },
          {
            type: 'true_false',
            en: { question: '"Alsjeblieft" can mean "here you go" when giving something.', explanation: 'True \u2014 it means both "please" and "here you go".' },
            pt: { question: '"Alsjeblieft" pode significar "aqui tem" ao dar algo.', explanation: 'Verdadeiro \u2014 significa "por favor" e "aqui tem".' },
            options: [
              { order: 1, text: 'true', correct: true },
              { order: 2, text: 'false', correct: false },
            ],
          },
        ],
      },
    ],
  },
  {
    sortOrder: 2,
    en: {
      title: 'Numbers, People & Everyday Basics',
      description: 'Count, talk about people around you and handle simple everyday situations.',
    },
    pt: {
      title: 'N\u00fameros, Pessoas e B\u00e1sicos do Dia a Dia',
      description: 'Conte, fale sobre as pessoas \u00e0 sua volta e lide com situa\u00e7\u00f5es simples do dia a dia.',
    },
    lessons: [
      {
        code: 'A0-04',
        sortOrder: 1,
        isFree: false,
        xpReward: 60,
        en: {
          title: 'Numbers 0\u20135',
          description: 'Your first Dutch numbers for prices, times and quantities.',
          objectives: ['Count from zero to five', 'Use numbers in simple phrases'],
        },
        pt: {
          title: 'N\u00fameros 0\u20135',
          description: 'Os seus primeiros n\u00fameros em holand\u00eas para pre\u00e7os, horas e quantidades.',
          objectives: ['Contar de zero a cinco', 'Usar n\u00fameros em frases simples'],
        },
        intro: {
          en: 'Numbers are everywhere \u2014 prices, phone numbers, times. Let\u2019s start with 0 to 5.',
          pt: 'Os n\u00fameros est\u00e3o em todo o lado \u2014 pre\u00e7os, n\u00fameros de telefone, horas. Comecemos de 0 a 5.',
        },
        vocab: [
          { dutch: 'nul', wordType: 'number', en: { translation: 'zero', hint: 'nuhl', example: 'Nul problemen.' }, pt: { translation: 'zero', hint: 'n\u00fal', example: 'Nul problemen.' } },
          { dutch: 'een', wordType: 'number', en: { translation: 'one', hint: 'ayn', example: 'Ik heb een broer.' }, pt: { translation: 'um', hint: '\u00e9in', example: 'Ik heb een broer.' } },
          { dutch: 'twee', wordType: 'number', en: { translation: 'two', hint: 'tvay', example: 'Twee koffie, alsjeblieft.' }, pt: { translation: 'dois', hint: 'tv\u00e9i', example: 'Twee koffie, alsjeblieft.' } },
          { dutch: 'drie', wordType: 'number', en: { translation: 'three', hint: 'dree', example: 'Drie euro.' }, pt: { translation: 'tr\u00eas', hint: 'dri', example: 'Drie euro.' } },
          { dutch: 'vier', wordType: 'number', en: { translation: 'four', hint: 'veer', example: 'Vier uur.' }, pt: { translation: 'quatro', hint: 'fir', example: 'Vier uur.' } },
          { dutch: 'vijf', wordType: 'number', en: { translation: 'five', hint: 'vayf', example: 'Vijf minuten.' }, pt: { translation: 'cinco', hint: 'faif', example: 'Vijf minuten.' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'What is "three" in Dutch?', instruction: 'Choose the correct number.', explanation: '"Drie" = three.' },
            pt: { question: 'Como se diz "tr\u00eas" em holand\u00eas?', instruction: 'Escolha o n\u00famero correto.', explanation: '"Drie" = tr\u00eas.' },
            options: [
              { order: 1, text: 'twee', correct: false },
              { order: 2, text: 'drie', correct: true },
              { order: 3, text: 'vijf', correct: false },
              { order: 4, text: 'nul', correct: false },
            ],
          },
          {
            type: 'word_order',
            en: { question: 'Build: "two coffees, please".', instruction: 'Tap the words in order.', explanation: 'Twee / koffie / alsjeblieft.' },
            pt: { question: 'Construa: "dois caf\u00e9s, por favor".', instruction: 'Toque nas palavras pela ordem.', explanation: 'Twee / koffie / alsjeblieft.' },
            options: [
              { order: 1, text: 'Twee', correct: true },
              { order: 2, text: 'koffie', correct: true },
              { order: 3, text: 'alsjeblieft', correct: true },
            ],
          },
          {
            type: 'fill_blank',
            en: { question: 'Write the Dutch word for "five".', instruction: 'Type your answer.', explanation: '"Vijf" = five.' },
            pt: { question: 'Escreva a palavra holandesa para "cinco".', instruction: 'Escreva a sua resposta.', explanation: '"Vijf" = cinco.' },
            options: [{ order: 1, text: 'vijf', correct: true }],
          },
        ],
      },
      {
        code: 'A0-05',
        sortOrder: 2,
        isFree: false,
        xpReward: 60,
        en: {
          title: 'People & Family',
          description: 'Talk about the people around you.',
          objectives: ['Name common people', 'Use "de" and "het" articles'],
        },
        pt: {
          title: 'Pessoas e Fam\u00edlia',
          description: 'Fale sobre as pessoas \u00e0 sua volta.',
          objectives: ['Nomear pessoas comuns', 'Usar os artigos "de" e "het"'],
        },
        intro: {
          en: 'Dutch nouns use "de" or "het". Learn the word together with its article \u2014 it is easier that way.',
          pt: 'Os substantivos holandeses usam "de" ou "het". Aprenda a palavra junto com o artigo \u2014 \u00e9 mais f\u00e1cil assim.',
        },
        vocab: [
          { dutch: 'de man', wordType: 'noun', gender: 'de', en: { translation: 'the man', hint: 'duh man', example: 'De man is aardig.' }, pt: { translation: 'o homem', hint: 'de man', example: 'De man is aardig.' } },
          { dutch: 'de vrouw', wordType: 'noun', gender: 'de', en: { translation: 'the woman', hint: 'duh vrow', example: 'De vrouw heet Els.' }, pt: { translation: 'a mulher', hint: 'de vrau', example: 'De vrouw heet Els.' } },
          { dutch: 'het kind', wordType: 'noun', gender: 'het', en: { translation: 'the child', hint: 'hut kint', example: 'Het kind speelt.' }, pt: { translation: 'a crian\u00e7a', hint: 'het kint', example: 'Het kind speelt.' } },
          { dutch: 'de vriend', wordType: 'noun', gender: 'de', en: { translation: 'the friend', hint: 'duh vreent', example: 'Mijn vriend woont hier.' }, pt: { translation: 'o amigo', hint: 'de frint', example: 'Mijn vriend woont hier.' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'Which article does "kind" (child) use?', instruction: 'Choose the correct article.', explanation: '"Het kind" \u2014 child uses "het".' },
            pt: { question: 'Que artigo usa "kind" (crian\u00e7a)?', instruction: 'Escolha o artigo correto.', explanation: '"Het kind" \u2014 crian\u00e7a usa "het".' },
            options: [
              { order: 1, text: 'de', correct: false },
              { order: 2, text: 'het', correct: true },
            ],
          },
          {
            type: 'match_pairs',
            en: { question: 'Match each word to its meaning.', instruction: 'Match the pairs.', explanation: 'man = man, vrouw = woman, kind = child.' },
            pt: { question: 'Associe cada palavra ao seu significado.', instruction: 'Associe os pares.', explanation: 'man = homem, vrouw = mulher, kind = crian\u00e7a.' },
            options: [
              { order: 1, text: 'de man|the man', correct: true },
              { order: 2, text: 'de vrouw|the woman', correct: true },
              { order: 3, text: 'het kind|the child', correct: true },
            ],
          },
          {
            type: 'true_false',
            en: { question: '"De vrouw" means "the man".', explanation: 'False \u2014 "de vrouw" means "the woman".' },
            pt: { question: '"De vrouw" significa "o homem".', explanation: 'Falso \u2014 "de vrouw" significa "a mulher".' },
            options: [
              { order: 1, text: 'true', correct: false },
              { order: 2, text: 'false', correct: true },
            ],
          },
        ],
      },
      {
        code: 'A0-06',
        sortOrder: 3,
        isFree: false,
        xpReward: 70,
        en: {
          title: 'At the Shop',
          description: 'Handle a simple everyday situation: buying basics.',
          objectives: ['Name everyday items', 'Combine words you already know'],
        },
        pt: {
          title: 'Na Loja',
          description: 'Lide com uma situa\u00e7\u00e3o simples do dia a dia: comprar o essencial.',
          objectives: ['Nomear objetos do dia a dia', 'Combinar palavras que j\u00e1 conhece'],
        },
        intro: {
          en: 'Let\u2019s put it together. You already know greetings, please and thank you \u2014 now add a few everyday words.',
          pt: 'Vamos juntar tudo. J\u00e1 sabe sauda\u00e7\u00f5es, por favor e obrigado \u2014 agora acrescente algumas palavras do dia a dia.',
        },
        vocab: [
          { dutch: 'water', wordType: 'noun', gender: 'het', en: { translation: 'water', hint: 'VAH-ter', example: 'Een glas water, alsjeblieft.' }, pt: { translation: '\u00e1gua', hint: 'V\u00c1-ter', example: 'Een glas water, alsjeblieft.' } },
          { dutch: 'brood', wordType: 'noun', gender: 'het', en: { translation: 'bread', hint: 'broht', example: 'Ik koop brood.' }, pt: { translation: 'p\u00e3o', hint: 'br\u00f4t', example: 'Ik koop brood.' } },
          { dutch: 'koffie', wordType: 'noun', gender: 'de', en: { translation: 'coffee', hint: 'KOF-ee', example: 'Koffie met melk.' }, pt: { translation: 'caf\u00e9', hint: 'K\u00d3-fi', example: 'Koffie met melk.' } },
          { dutch: 'de winkel', wordType: 'noun', gender: 'de', en: { translation: 'the shop', hint: 'duh VIN-kul', example: 'De winkel is open.' }, pt: { translation: 'a loja', hint: 'de VIN-kel', example: 'De winkel is open.' } },
        ],
        exercises: [
          {
            type: 'mcq',
            en: { question: 'You want to order water. Which word do you need?', instruction: 'Choose the correct word.', explanation: '"Water" = water.' },
            pt: { question: 'Quer pedir \u00e1gua. De que palavra precisa?', instruction: 'Escolha a palavra correta.', explanation: '"Water" = \u00e1gua.' },
            options: [
              { order: 1, text: 'brood', correct: false },
              { order: 2, text: 'water', correct: true },
              { order: 3, text: 'koffie', correct: false },
              { order: 4, text: 'winkel', correct: false },
            ],
          },
          {
            type: 'word_order',
            en: { question: 'Build: "a glass of water, please".', instruction: 'Tap the words in order.', explanation: 'Een / glas / water / alsjeblieft.' },
            pt: { question: 'Construa: "um copo de \u00e1gua, por favor".', instruction: 'Toque nas palavras pela ordem.', explanation: 'Een / glas / water / alsjeblieft.' },
            options: [
              { order: 1, text: 'Een', correct: true },
              { order: 2, text: 'glas', correct: true },
              { order: 3, text: 'water', correct: true },
              { order: 4, text: 'alsjeblieft', correct: true },
            ],
          },
          {
            type: 'fill_blank',
            en: { question: 'Write the Dutch word for "bread".', instruction: 'Type your answer.', explanation: '"Brood" = bread.' },
            pt: { question: 'Escreva a palavra holandesa para "p\u00e3o".', instruction: 'Escreva a sua resposta.', explanation: '"Brood" = p\u00e3o.' },
            options: [{ order: 1, text: 'brood', correct: true }],
          },
        ],
      },
    ],
  },
];

export async function seedA0Content(prisma: AnyPrisma) {
  const a0 = await prisma.level.findUnique({ where: { code: 'A0' } });
  if (!a0) {
    console.log('A0 level not found, skipping content seed.');
    return;
  }

  for (const mod of MODULES) {
    let moduleRow = await prisma.module.findFirst({
      where: { levelId: a0.id, sortOrder: mod.sortOrder },
    });
    if (!moduleRow) {
      moduleRow = await prisma.module.create({
        data: { levelId: a0.id, sortOrder: mod.sortOrder, isPublished: true },
      });
    } else {
      await prisma.module.update({
        where: { id: moduleRow.id },
        data: { isPublished: true },
      });
    }

    for (const loc of ['en', 'pt'] as const) {
      await prisma.moduleTranslation.upsert({
        where: { moduleId_locale: { moduleId: moduleRow.id, locale: loc } },
        update: { title: mod[loc].title, description: mod[loc].description },
        create: {
          moduleId: moduleRow.id,
          locale: loc,
          title: mod[loc].title,
          description: mod[loc].description,
        },
      });
    }

    for (const lessonDef of mod.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { lessonCode: lessonDef.code },
        update: {
          moduleId: moduleRow.id,
          sortOrder: lessonDef.sortOrder,
          isPublished: true,
          isFree: lessonDef.isFree,
          xpReward: lessonDef.xpReward,
        },
        create: {
          moduleId: moduleRow.id,
          lessonCode: lessonDef.code,
          sortOrder: lessonDef.sortOrder,
          isPublished: true,
          isFree: lessonDef.isFree,
          estimatedMinutes: 8,
          xpReward: lessonDef.xpReward,
        },
      });

      for (const loc of ['en', 'pt'] as const) {
        await prisma.lessonTranslation.upsert({
          where: { lessonId_locale: { lessonId: lesson.id, locale: loc } },
          update: {
            title: lessonDef[loc].title,
            description: lessonDef[loc].description,
            learningObjectives: lessonDef[loc].objectives,
          },
          create: {
            lessonId: lesson.id,
            locale: loc,
            title: lessonDef[loc].title,
            description: lessonDef[loc].description,
            learningObjectives: lessonDef[loc].objectives,
          },
        });
      }

      // Vocabulary
      const vocabIds: number[] = [];
      for (const v of lessonDef.vocab) {
        let vocRow = await prisma.vocabulary.findFirst({
          where: { dutchWord: v.dutch },
        });
        if (!vocRow) {
          vocRow = await prisma.vocabulary.create({
            data: {
              dutchWord: v.dutch,
              wordType: v.wordType ?? null,
              gender: v.gender ?? null,
              difficulty: 1,
            },
          });
        }
        for (const loc of ['en', 'pt'] as const) {
          await prisma.vocabularyTranslation.upsert({
            where: {
              vocabularyId_locale: { vocabularyId: vocRow.id, locale: loc },
            },
            update: {
              translation: v[loc].translation,
              pronunciationHint: v[loc].hint,
              exampleSentence: v[loc].example,
            },
            create: {
              vocabularyId: vocRow.id,
              locale: loc,
              translation: v[loc].translation,
              pronunciationHint: v[loc].hint,
              exampleSentence: v[loc].example,
            },
          });
        }
        vocabIds.push(vocRow.id);
        await prisma.lessonVocabulary.upsert({
          where: {
            lessonId_vocabularyId: {
              lessonId: lesson.id,
              vocabularyId: vocRow.id,
            },
          },
          update: {},
          create: { lessonId: lesson.id, vocabularyId: vocRow.id },
        });
      }

      // Sections + exercises only if not already created for this lesson.
      const existingSections = await prisma.lessonSection.count({
        where: { lessonId: lesson.id },
      });
      if (existingSections === 0) {
        // 1. intro
        await prisma.lessonSection.create({
          data: {
            lessonId: lesson.id,
            sortOrder: 1,
            sectionType: 'intro',
            content: { en: lessonDef.intro.en, pt: lessonDef.intro.pt },
          },
        });
        // 2. vocab (renders LessonVocabulary)
        await prisma.lessonSection.create({
          data: {
            lessonId: lesson.id,
            sortOrder: 2,
            sectionType: 'vocab',
            content: { vocabularyIds: vocabIds },
          },
        });
        // 3. quiz (references exercises)
        const exerciseIds: number[] = [];
        for (const ex of lessonDef.exercises) {
          const exRow = await prisma.exercise.create({
            data: { exerciseType: ex.type, difficulty: 1 },
          });
          for (const loc of ['en', 'pt'] as const) {
            await prisma.exerciseTranslation.create({
              data: {
                exerciseId: exRow.id,
                locale: loc,
                question: ex[loc].question,
                instruction: ex[loc].instruction ?? null,
                explanation: ex[loc].explanation ?? null,
              },
            });
          }
          for (const opt of ex.options) {
            await prisma.exerciseOption.create({
              data: {
                exerciseId: exRow.id,
                sortOrder: opt.order,
                optionText: opt.text,
                isCorrect: opt.correct,
              },
            });
          }
          exerciseIds.push(exRow.id);
        }
        await prisma.lessonSection.create({
          data: {
            lessonId: lesson.id,
            sortOrder: 3,
            sectionType: 'quiz',
            content: { exerciseIds },
          },
        });
      }
    }
  }

  console.log('A0 content seeded.');
}
