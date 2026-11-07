import { setTimeout as delay } from 'node:timers/promises';
import type { APIPayload } from '../../src/@types/api.ts';
import type { RecipeResponse } from '../../src/@types/recipe.ts';

/*
 * Demo mode (no GEMINI_API_KEY): realistic sample data so the whole flow
 * can be explored right after `npm install`. The UI flags demo recipes.
 */

const CREAMY_EGGS: RecipeResponse = {
  nome_receita: 'Ovos Mexidos Cremosos com Tomate e Queijo',
  tempo_preparo: '10 min',
  dificuldade: 'Fácil',
  ingredientes_utilizados: [
    '3 ovos',
    '1 tomate sem sementes picado',
    '50 g de queijo muçarela ralado',
    '1 colher (sopa) de manteiga',
    'Sal e pimenta-do-reino a gosto',
    'Cheiro-verde picado a gosto',
  ],
  passo_a_passo: [
    'Bata os ovos em uma tigela com uma pitada de sal e pimenta, só até misturar.',
    'Derreta a manteiga em fogo baixo e refogue o tomate por 2 minutos.',
    'Junte os ovos e mexa devagar com uma espátula, puxando das bordas para o centro.',
    'Quando ainda estiverem úmidos, desligue o fogo e acrescente o queijo.',
    'Finalize com cheiro-verde e sirva na hora.',
  ],
  dica_do_chef:
    'Tire os ovos do fogo um pouco antes do ponto: o calor residual termina o cozimento e garante a cremosidade.',
  prompt_imagem:
    'Creamy scrambled eggs with diced tomatoes and melted mozzarella in a black skillet, topped with fresh chives',
};

const FRIED_RICE: RecipeResponse = {
  nome_receita: 'Arroz de Frigideira com Legumes e Ovo',
  tempo_preparo: '15 min',
  dificuldade: 'Fácil',
  ingredientes_utilizados: [
    '2 xícaras de arroz cozido (sobra)',
    '1 cenoura ralada',
    '1/2 cebola picada',
    '1 dente de alho amassado',
    '2 ovos',
    '1 colher (sopa) de óleo',
    'Sal e cheiro-verde a gosto',
  ],
  passo_a_passo: [
    'Aqueça o óleo em uma frigideira grande e doure a cebola e o alho por 2 minutos.',
    'Junte a cenoura e refogue por mais 2 minutos.',
    'Acrescente o arroz, solte os grãos com um garfo e deixe dourar levemente.',
    'Abra um espaço no centro, quebre os ovos e mexa até cozinharem.',
    'Misture tudo, acerte o sal e finalize com cheiro-verde.',
  ],
  dica_do_chef: 'Arroz de geladeira fica mais soltinho na frigideira. Use qualquer legume que estiver sobrando.',
  prompt_imagem:
    'Golden pan fried rice with grated carrots, scrambled eggs and green onions in a large skillet, rustic home cooking',
};

const CRISPY_CHICKPEAS: RecipeResponse = {
  nome_receita: 'Grão-de-bico Crocante com Legumes e Limão',
  tempo_preparo: '15 min',
  dificuldade: 'Fácil',
  ingredientes_utilizados: [
    '1 lata de grão-de-bico escorrido',
    '1 abobrinha em cubos',
    '1/2 pimentão vermelho em tiras',
    '1 dente de alho picado',
    'Suco de 1/2 limão',
    '2 colheres (sopa) de azeite',
    'Sal, páprica e pimenta a gosto',
  ],
  passo_a_passo: [
    'Seque bem o grão-de-bico com um pano de prato limpo.',
    'Aqueça o azeite e doure o grão-de-bico com a páprica por 5 minutos, mexendo de vez em quando.',
    'Junte a abobrinha, o pimentão e o alho e salteie em fogo alto por 4 minutos.',
    'Tempere com sal, pimenta e o suco de limão.',
    'Sirva quente, puro ou sobre folhas verdes.',
  ],
  dica_do_chef: 'Quanto mais seco o grão-de-bico, mais crocante ele fica. Não lote a frigideira.',
  prompt_imagem:
    'Crispy sauteed chickpeas with zucchini and red bell pepper, lemon wedges, served in a rustic ceramic bowl',
};

function rankRecipes({ mode, profile }: APIPayload): RecipeResponse[] {
  const restrictions = new Set(profile.dietaryRestrictions);
  if (restrictions.has('vegan') || restrictions.has('lactose_free')) {
    return [CRISPY_CHICKPEAS, FRIED_RICE, CREAMY_EGGS];
  }
  if ((mode === 'fridgeCleanup' || mode === 'budget') && !restrictions.has('low_carb')) {
    return [FRIED_RICE, CREAMY_EGGS, CRISPY_CHICKPEAS];
  }
  return [CREAMY_EGGS, FRIED_RICE, CRISPY_CHICKPEAS];
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

/** True when any listed ingredient mentions something the user dislikes ("Cebola" matches "1/2 cebola picada"). */
function usesDisliked(recipe: RecipeResponse, disliked: string[]): boolean {
  const terms = disliked.map(normalize).filter((term) => term.length >= 3);
  return recipe.ingredientes_utilizados.some((ingredient) => terms.some((term) => normalize(ingredient).includes(term)));
}

export async function getDemoRecipe(payload: APIPayload): Promise<RecipeResponse> {
  await delay(1_200); // lets the loading skeleton be seen, like a real call
  const avoided = new Set(payload.avoidRecipes ?? []);
  const ranked = rankRecipes(payload);
  const candidates = ranked.filter((item) => !usesDisliked(item, payload.userContext.dislikedIngredients));
  const pool = candidates.length > 0 ? candidates : ranked;
  const recipe = pool.find((item) => !avoided.has(item.nome_receita)) ?? pool[0] ?? CREAMY_EGGS;
  if (payload.batchCooking) return toBatch(recipe);
  return payload.mode === 'quick10' ? { ...recipe, tempo_preparo: '10 min' } : { ...recipe };
}

/** Demo version of "Modo Marmitas": same dish, with portions, storage and freezing guidance. */
function toBatch(recipe: RecipeResponse): RecipeResponse {
  return {
    ...recipe,
    nome_receita: `${recipe.nome_receita} (4 marmitas)`,
    tempo_preparo: '25 min',
    // Demo data cannot rescale quantities, so it marks them instead ("a gosto" items stay as they are).
    ingredientes_utilizados: recipe.ingredientes_utilizados.map((item) => (/a gosto/i.test(item) ? item : `${item} (×4)`)),
    passo_a_passo: [
      ...recipe.passo_a_passo.slice(0, 6),
      'Divida em 4 potes herméticos e deixe amornar. Leve à geladeira em até 2 horas.',
      'Guarde por até 4 dias a 4 °C ou menos e reaqueça até soltar vapor antes de comer.',
    ],
    dica_do_chef: 'As porções extras podem ir ao congelador por até 2 meses. Descongele na geladeira na véspera.',
    prompt_imagem: `${recipe.prompt_imagem}, portioned into four meal prep containers`,
  };
}

export async function getDemoTranscription(): Promise<string> {
  await delay(900);
  return '2 ovos, 1 tomate, um pedaço de queijo muçarela e cebolinha';
}
