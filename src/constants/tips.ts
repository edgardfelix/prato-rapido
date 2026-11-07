import { Salad, Snowflake, Zap, type LucideIcon } from 'lucide-react';
import type { Tip, TipCategory } from '@/@types';

export interface TipCategoryOption {
  value: TipCategory;
  label: string;
  icon: LucideIcon;
}

export const TIP_CATEGORIES: TipCategoryOption[] = [
  { value: 'healthy_swaps', label: 'Substituições', icon: Salad },
  { value: 'storage', label: 'Conservação', icon: Snowflake },
  { value: 'quick_prep', label: 'Preparo Rápido', icon: Zap },
];

export const TIPS: Tip[] = [
  // Substituições saudáveis
  {
    id: 'yogurt-cream',
    category: 'healthy_swaps',
    title: 'Iogurte natural no lugar do creme de leite',
    summary: 'Molhos cremosos com menos gordura.',
    details: [
      'Use iogurte natural integral em molhos frios, pastas e finalizações.',
      'Em molhos quentes, junte fora do fogo para não talhar.',
      'Uma colher (chá) de amido de milho misturada ao iogurte ajuda a estabilizar.',
    ],
    goals: ['weight_loss', 'balanced_diet'],
  },
  {
    id: 'oat-breading',
    category: 'healthy_swaps',
    title: 'Aveia em flocos no empanado',
    summary: 'Crocância com mais fibras que a farinha de rosca.',
    details: [
      'Passe o alimento no ovo batido e depois na aveia temperada.',
      'Asse ou leve à airfryer: fica crocante com pouco óleo.',
      'Para uma versão sem glúten, use aveia certificada sem glúten.',
    ],
    goals: ['balanced_diet', 'weight_loss'],
  },
  {
    id: 'airfryer-fry',
    category: 'healthy_swaps',
    title: 'Troque a fritura pela airfryer ou forno bem quente',
    summary: 'O mesmo dourado com uma fração do óleo.',
    details: [
      'Pincele ou borrife 1 colher (chá) de óleo em vez de mergulhar o alimento.',
      'Não lote o cesto: o ar precisa circular para dourar.',
      'Vire na metade do tempo para a crocância ficar por igual.',
    ],
    goals: ['weight_loss'],
  },
  {
    id: 'cauliflower-rice',
    category: 'healthy_swaps',
    title: 'Arroz de couve-flor',
    summary: 'Base low carb pronta em 5 minutos.',
    details: [
      'Rale a couve-flor no ralo grosso ou pulse no processador.',
      'Salteie em frigideira quente com um fio de azeite por 4 a 5 minutos.',
      'Tempere com alho, sal e cheiro-verde e sirva como arroz.',
    ],
    goals: ['weight_loss'],
  },
  {
    id: 'herbs-salt',
    category: 'healthy_swaps',
    title: 'Menos sal, mais sabor',
    summary: 'Ervas, limão e alho realçam sem pesar no sódio.',
    details: [
      'Finalize com raspas e suco de limão para dar frescor ao prato.',
      'Alho, cebola, páprica e pimenta-do-reino aumentam o sabor sem sal extra.',
      'Ervas frescas entram no fim; as secas, no começo do preparo.',
    ],
    goals: ['balanced_diet'],
  },
  {
    id: 'protein-boost',
    category: 'healthy_swaps',
    title: 'Turbine a proteína sem complicar',
    summary: 'Ovo, grão-de-bico e iogurte elevam a proteína de qualquer prato.',
    details: [
      'Junte um ovo cozido picado à salada ou ao arroz.',
      'Grão-de-bico em lata, escorrido, vai bem em saladas, refogados e na airfryer.',
      'Iogurte natural ou queijo cottage deixam o lanche mais proteico.',
    ],
    goals: ['muscle_gain'],
  },
  // Conservação
  {
    id: 'leftovers-rule',
    category: 'storage',
    title: 'Sobras: geladeira em até 2 horas',
    summary: 'Guarde rápido e consuma em até 3 a 4 dias.',
    details: [
      'Leve as sobras à geladeira em até 2 horas depois do preparo.',
      'Consuma em até 3 a 4 dias ou congele em porções.',
      'Potes rasos esfriam mais rápido e de forma mais segura.',
    ],
    goals: [],
  },
  {
    id: 'fresh-herbs',
    category: 'storage',
    title: 'Ervas frescas por mais tempo',
    summary: 'Papel-toalha úmido e pote fechado.',
    details: [
      'Lave, seque bem e enrole as folhas em papel-toalha levemente úmido.',
      'Guarde em pote fechado na gaveta de legumes.',
      'Salsinha e coentro também duram mais como buquê, em um copo com água na geladeira.',
    ],
    goals: [],
  },
  {
    id: 'tomato-room',
    category: 'storage',
    title: 'Tomate amadurece fora da geladeira',
    summary: 'O frio tira o sabor e a textura do tomate verde.',
    details: [
      'Deixe os tomates em temperatura ambiente até amadurecerem.',
      'Depois de maduros, use em 1 ou 2 dias ou leve à geladeira.',
      'Tomate cortado vai para a geladeira em pote fechado.',
    ],
    goals: [],
  },
  {
    id: 'onion-potato',
    category: 'storage',
    title: 'Cebola e batata em lugares separados',
    summary: 'Juntas, as duas estragam mais rápido.',
    details: [
      'A umidade e os gases da cebola aceleram a brotação da batata.',
      'Guarde ambas em local fresco, seco e escuro, cada uma no seu canto.',
      'Em batatas brotadas, retire os brotos e as partes verdes antes de usar.',
    ],
    goals: [],
  },
  {
    id: 'banana-freeze',
    category: 'storage',
    title: 'Banana madura vira ingrediente',
    summary: 'Congele em rodelas para vitaminas e doces.',
    details: [
      'Descasque, corte em rodelas e congele espalhadas em uma assadeira.',
      'Depois de congeladas, guarde em saco ou pote fechado.',
      'Use direto no liquidificador para vitaminas cremosas.',
    ],
    goals: ['balanced_diet'],
  },
  {
    id: 'label-dates',
    category: 'storage',
    title: 'Etiquete e organize por data',
    summary: 'O que vence primeiro fica na frente.',
    details: [
      'Anote a data em potes de sobras e congelados.',
      'Deixe os itens mais antigos na frente da geladeira.',
      'Antes de ir ao mercado, use o atalho Limpa Geladeira com o que está para vencer.',
    ],
    goals: [],
  },
  // Preparo rápido
  {
    id: 'mise-en-place',
    category: 'quick_prep',
    title: 'Mise en place em 2 minutos',
    summary: 'Separe tudo antes de ligar o fogo.',
    details: [
      'Lave, corte e meça os ingredientes antes de começar.',
      'Deixe temperos e utensílios ao alcance da mão.',
      'Com tudo pronto, a receita flui sem pausas e nada queima.',
    ],
    goals: ['quick_meals'],
  },
  {
    id: 'lid-boil',
    category: 'quick_prep',
    title: 'Água ferve mais rápido com tampa',
    summary: 'Menos tempo e menos gás.',
    details: [
      'Tampe a panela até levantar fervura.',
      'Use só a quantidade de água necessária.',
      'A chaleira elétrica é ainda mais rápida para massas e legumes.',
    ],
    goals: ['quick_meals'],
  },
  {
    id: 'small-cuts',
    category: 'quick_prep',
    title: 'Corte menor, cozimento mais rápido',
    summary: 'Pedaços pequenos e iguais cozinham por igual.',
    details: [
      'Cubos de 1 cm de legumes ficam prontos em poucos minutos na frigideira.',
      'Tiras finas de frango ou carne cozinham em 3 a 4 minutos.',
      'Tamanhos iguais evitam partes cruas e outras passadas.',
    ],
    goals: ['quick_meals', 'muscle_gain'],
  },
  {
    id: 'big-pan',
    category: 'quick_prep',
    title: 'Use a maior frigideira',
    summary: 'Mais área doura em vez de cozinhar no vapor.',
    details: [
      'Ingredientes amontoados soltam água e não douram.',
      'Espalhe em camada única e aqueça bem a frigideira antes.',
      'Se precisar, faça em duas levas: no total, sai mais rápido.',
    ],
    goals: ['quick_meals'],
  },
  {
    id: 'microwave-veg',
    category: 'quick_prep',
    title: 'Legumes no vapor do micro-ondas',
    summary: 'Brócolis e cenoura no ponto em 3 a 4 minutos.',
    details: [
      'Coloque os legumes picados em um refratário com 2 colheres (sopa) de água.',
      'Cubra com tampa própria para micro-ondas, deixando uma saída para o vapor.',
      'Aqueça por 3 a 4 minutos e confira o ponto. Cuidado com o vapor ao abrir.',
    ],
    goals: ['quick_meals', 'weight_loss'],
  },
  {
    id: 'microwave-egg',
    category: 'quick_prep',
    title: 'Ovo no micro-ondas, do jeito certo',
    summary: 'Mexido em 1 minuto e sem sustos.',
    details: [
      'Bata o ovo em uma caneca e aqueça em etapas de 30 segundos, mexendo entre elas.',
      'Nunca aqueça ovo com casca, nem gema inteira sem furar: pode estourar.',
      'Tempere depois de pronto.',
    ],
    goals: ['quick_meals', 'muscle_gain'],
  },
];
