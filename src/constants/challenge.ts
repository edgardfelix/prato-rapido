import {
  Apple,
  Banana,
  CakeSlice,
  Carrot,
  Cherry,
  CircleHelp,
  Citrus,
  Coffee,
  Cookie,
  Croissant,
  Egg,
  Fish,
  Grape,
  IceCreamCone,
  Pizza,
  Popcorn,
  Sandwich,
  type LucideIcon,
} from 'lucide-react';
import type { ChallengeIconId } from '@/@types';

/** Icons of the human check. The server picks which ones appear (and the answer). */
const CHALLENGE_ICONS: Record<ChallengeIconId, LucideIcon> = {
  carrot: Carrot,
  apple: Apple,
  cherry: Cherry,
  banana: Banana,
  grape: Grape,
  citrus: Citrus,
  egg: Egg,
  fish: Fish,
  croissant: Croissant,
  pizza: Pizza,
  coffee: Coffee,
  ice_cream: IceCreamCone,
  cake: CakeSlice,
  cookie: Cookie,
  sandwich: Sandwich,
  popcorn: Popcorn,
};

/** Falls back to a neutral icon if a newer server sends an id this build does not know. */
export const getChallengeIcon = (id: string): LucideIcon =>
  Object.hasOwn(CHALLENGE_ICONS, id) ? CHALLENGE_ICONS[id as ChallengeIconId] : CircleHelp;
