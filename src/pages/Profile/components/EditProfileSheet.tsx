import { useState, type FormEvent } from 'react';
import { Cake, Check, Mail, User as UserIcon } from 'lucide-react';
import styled from 'styled-components';
import type { User, UserProfile } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/organisms/Modal';
import {
  hasErrors,
  PROFILE_FIELDS,
  validateProfile,
  type ProfileDraft,
} from '@/utils/profileValidation';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (profile: UserProfile) => void;
}

export function EditProfileSheet({ isOpen, onClose, user, onSave }: EditProfileSheetProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar dados">
      {/* Remounts on every opening so the form always starts from the saved values. */}
      <EditProfileForm
        key={String(isOpen)}
        user={user}
        onSave={(profile) => {
          onSave(profile);
          onClose();
        }}
      />
    </Modal>
  );
}

function EditProfileForm({ user, onSave }: { user: User; onSave: (profile: UserProfile) => void }) {
  const [draft, setDraft] = useState<ProfileDraft>({ name: user.name, age: String(user.age), email: user.email });
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateProfile(draft);
  const visible = (field: keyof ProfileDraft) => (showErrors ? errors[field] : undefined);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasErrors(errors)) {
      setShowErrors(true);
      const firstInvalid = PROFILE_FIELDS.find((field) => errors[field]);
      if (firstInvalid) event.currentTarget.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus();
      return;
    }
    onSave({
      name: draft.name.trim().replace(/\s+/g, ' '),
      age: Number(draft.age),
      email: draft.email.trim().toLowerCase(),
    });
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome"
        icon={UserIcon}
        name="name"
        value={draft.name}
        onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        error={visible('name')}
        autoComplete="given-name"
        autoCapitalize="words"
        maxLength={60}
      />
      <Input
        label="Idade"
        icon={Cake}
        name="age"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft.age}
        onChange={(event) =>
          setDraft((current) => ({ ...current, age: event.target.value.replace(/\D/g, '').slice(0, 3) }))
        }
        error={visible('age')}
        autoComplete="off"
      />
      <Input
        label="E-mail"
        icon={Mail}
        name="email"
        type="email"
        inputMode="email"
        value={draft.email}
        onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
        error={visible('email')}
        autoComplete="email"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={120}
      />
      <Button type="submit" size="lg" fullWidth leftIcon={<Check size={18} />}>
        Salvar alterações
      </Button>
    </Form>
  );
}
