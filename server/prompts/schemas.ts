/*
 * JSON Schemas for Gemini structured output (`responseJsonSchema`).
 * The model emits keys in the order they are declared here.
 */

export const RECIPE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    nome_receita: { type: 'string', description: 'Short, appetizing recipe name in pt-BR.' },
    tempo_preparo: { type: 'string', description: 'Realistic total time, e.g. "12 min".' },
    dificuldade: { type: 'string', enum: ['Fácil', 'Média', 'Difícil'] },
    ingredientes_utilizados: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 15,
      description: 'Ingredients with quantities, in pt-BR.',
    },
    passo_a_passo: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 10,
      description: 'Ordered, actionable steps in pt-BR, without numbering.',
    },
    dica_do_chef: { type: 'string', description: 'One practical tip in pt-BR.' },
    prompt_imagem: { type: 'string', description: 'One short English sentence for a photorealistic food photo.' },
  },
  required: [
    'nome_receita',
    'tempo_preparo',
    'dificuldade',
    'ingredientes_utilizados',
    'passo_a_passo',
    'dica_do_chef',
    'prompt_imagem',
  ],
} as const;

export const TRANSCRIPTION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transcricao: { type: 'string', description: 'Clean pt-BR transcription, or an empty string.' },
  },
  required: ['transcricao'],
} as const;
