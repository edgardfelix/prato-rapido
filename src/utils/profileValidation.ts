import { LIMITS } from '@/constants/limits';

export interface ProfileDraft {
  name: string;
  age: string;
  email: string;
}

export type ProfileField = keyof ProfileDraft;
export type ProfileErrors = Partial<Record<ProfileField, string>>;

export const PROFILE_FIELDS: ProfileField[] = ['name', 'age', 'email'];

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateProfile(draft: ProfileDraft): ProfileErrors {
  const errors: ProfileErrors = {};

  const name = draft.name.trim();
  if (name.length < 2) errors.name = 'Digite seu nome (mínimo de 2 letras).';
  else if (name.length > 60) errors.name = 'Use no máximo 60 caracteres.';
  else if (!NAME_PATTERN.test(name)) errors.name = 'Use apenas letras no nome.';

  const ageText = draft.age.trim();
  const age = Number(ageText);
  if (!ageText) errors.age = 'Informe sua idade.';
  else if (!Number.isInteger(age) || age < LIMITS.userMinAge || age > LIMITS.userMaxAge) {
    errors.age = `Informe uma idade entre ${LIMITS.userMinAge} e ${LIMITS.userMaxAge} anos.`;
  }

  const email = draft.email.trim();
  if (!email) errors.email = 'Informe seu e-mail.';
  else if (email.length > 120 || !EMAIL_PATTERN.test(email)) errors.email = 'Digite um e-mail válido, como nome@email.com.';

  return errors;
}

export const hasErrors = (errors: ProfileErrors) => Object.keys(errors).length > 0;
