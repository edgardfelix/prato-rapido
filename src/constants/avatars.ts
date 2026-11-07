import {
  Apple,
  Bot,
  CakeSlice,
  Carrot,
  ChefHat,
  Cherry,
  Citrus,
  CodeXml,
  Coffee,
  CookingPot,
  Cpu,
  Croissant,
  Egg,
  Fish,
  Gamepad2,
  Headphones,
  Pizza,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import type { AvatarIconId } from '@/@types';

export type AvatarGroup = 'gourmet' | 'tech';

export interface AvatarIconOption {
  id: AvatarIconId;
  label: string;
  group: AvatarGroup;
  icon: LucideIcon;
  /** Decorative hue; the background uses the same hue at low opacity in both themes. */
  color: string;
}

export const AVATAR_ICONS: AvatarIconOption[] = [
  { id: 'chef', label: 'Chef', group: 'gourmet', icon: ChefHat, color: '#10B981' },
  { id: 'carrot', label: 'Cenoura', group: 'gourmet', icon: Carrot, color: '#F97316' },
  { id: 'apple', label: 'Maçã', group: 'gourmet', icon: Apple, color: '#EF4444' },
  { id: 'cherry', label: 'Cereja', group: 'gourmet', icon: Cherry, color: '#F43F5E' },
  { id: 'pizza', label: 'Pizza', group: 'gourmet', icon: Pizza, color: '#F59E0B' },
  { id: 'fish', label: 'Peixe', group: 'gourmet', icon: Fish, color: '#0EA5E9' },
  { id: 'egg', label: 'Ovo', group: 'gourmet', icon: Egg, color: '#EAB308' },
  { id: 'croissant', label: 'Croissant', group: 'gourmet', icon: Croissant, color: '#D97706' },
  { id: 'coffee', label: 'Café', group: 'gourmet', icon: Coffee, color: '#B45309' },
  { id: 'citrus', label: 'Limão', group: 'gourmet', icon: Citrus, color: '#84CC16' },
  { id: 'cooking_pot', label: 'Panela', group: 'gourmet', icon: CookingPot, color: '#14B8A6' },
  { id: 'cake', label: 'Bolo', group: 'gourmet', icon: CakeSlice, color: '#EC4899' },
  { id: 'bot', label: 'Robô chef', group: 'tech', icon: Bot, color: '#8B5CF6' },
  { id: 'cpu', label: 'Processador', group: 'tech', icon: Cpu, color: '#06B6D4' },
  { id: 'rocket', label: 'Foguete', group: 'tech', icon: Rocket, color: '#F43F5E' },
  { id: 'gamepad', label: 'Controle de videogame', group: 'tech', icon: Gamepad2, color: '#6366F1' },
  { id: 'headphones', label: 'Fones de ouvido', group: 'tech', icon: Headphones, color: '#0EA5E9' },
  { id: 'code', label: 'Código', group: 'tech', icon: CodeXml, color: '#22C55E' },
];

export const AVATAR_GROUPS: { id: AvatarGroup; label: string }[] = [
  { id: 'gourmet', label: 'Gourmet' },
  { id: 'tech', label: 'Tech' },
];

export const AVATAR_ICON_IDS = AVATAR_ICONS.map((option) => option.id);

export const findAvatarIcon = (id: AvatarIconId) => AVATAR_ICONS.find((option) => option.id === id);
