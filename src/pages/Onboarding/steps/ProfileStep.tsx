import type { RefObject } from 'react';
import { Cake, Lock, Mail, User } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { BrandLogo } from '@/components/molecules/BrandLogo';
import * as S from '../styles';
import type { ProfileDraft, ProfileErrors, ProfileField } from '@/utils/profileValidation';

interface ProfileStepProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  draft: ProfileDraft;
  errors: ProfileErrors;
  touched: Record<ProfileField, boolean>;
  isEditing: boolean;
  onChange: (field: ProfileField, value: string) => void;
  onBlur: (field: ProfileField) => void;
}

export function ProfileStep({ headingRef, draft, errors, touched, isEditing, onChange, onBlur }: ProfileStepProps) {
  const visibleError = (field: ProfileField) => (touched[field] ? errors[field] : undefined);

  return (
    <S.StepBody>
      {!isEditing && (
        <S.Hero>
          <BrandLogo variant="full" />
        </S.Hero>
      )}
      <S.Heading ref={headingRef} tabIndex={-1}>
        {isEditing ? 'Seus dados' : 'Receitas rápidas com o que você tem em casa'}
      </S.Heading>
      <S.Intro>
        {isEditing
          ? 'Atualize seu perfil quando quiser.'
          : 'Conte um pouco sobre você para personalizarmos cada prato.'}
      </S.Intro>

      <S.Fields>
        <Input
          label="Como podemos te chamar?"
          icon={User}
          name="name"
          value={draft.name}
          onChange={(event) => onChange('name', event.target.value)}
          onBlur={() => onBlur('name')}
          error={visibleError('name')}
          placeholder="Seu nome"
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={60}
        />
        <Input
          label="Idade"
          icon={Cake}
          name="age"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft.age}
          onChange={(event) => onChange('age', event.target.value.replace(/\D/g, '').slice(0, 3))}
          onBlur={() => onBlur('age')}
          error={visibleError('age')}
          hint="Usamos para ajustar técnicas e cuidados ao seu perfil."
          placeholder="Ex.: 28"
          autoComplete="off"
          enterKeyHint="next"
        />
        <Input
          label="E-mail"
          icon={Mail}
          name="email"
          type="email"
          inputMode="email"
          value={draft.email}
          onChange={(event) => onChange('email', event.target.value)}
          onBlur={() => onBlur('email')}
          error={visibleError('email')}
          placeholder="nome@email.com"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={120}
        />
      </S.Fields>

      <S.PrivacyNote>
        <Lock size={14} aria-hidden="true" />
        Seus dados ficam salvos apenas neste aparelho.
      </S.PrivacyNote>
    </S.StepBody>
  );
}
