/** Icons the human check can ask for (chosen by the server, drawn by the client). */
export type ChallengeIconId =
  | 'carrot'
  | 'apple'
  | 'cherry'
  | 'banana'
  | 'grape'
  | 'citrus'
  | 'egg'
  | 'fish'
  | 'croissant'
  | 'pizza'
  | 'coffee'
  | 'ice_cream'
  | 'cake'
  | 'cookie'
  | 'sandwich'
  | 'popcorn';

export interface HumanChallengeOption {
  /** Random per challenge: this is the answer sent back to the server. */
  id: string;
  icon: ChallengeIconId;
  /** PT-BR name, used as the accessible label. */
  label: string;
}

/** Response of `GET /api/challenge`. */
export interface HumanChallenge {
  /** Signed, short-lived token (opaque to the client). */
  token: string;
  /** PT-BR name of the icon to tap, e.g. "Cenoura". */
  target: string;
  options: HumanChallengeOption[];
  expiresAt: string;
}

/** Body of `POST /api/challenge/verify`. */
export interface HumanChallengeAnswer {
  token: string;
  answer: string;
}

/** Response of `POST /api/challenge/verify`. `token` goes in the `X-Human-Token` header of AI requests. */
export interface HumanVerification {
  token: string;
  expiresAt: string;
}
