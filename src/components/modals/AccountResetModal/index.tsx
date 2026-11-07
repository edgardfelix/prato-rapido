import { useState, type FormEvent } from 'react';
import { KeyRound, RotateCcw, Trash2 } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { OptionCard } from '@/components/molecules/OptionCard';
import { Modal } from '@/components/organisms/Modal';

export type ResetKind = 'progress' | 'everything';

/** Typed confirmation for the irreversible "erase everything" option. */
const CONFIRM_WORD = 'APAGAR';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  margin-top: 4px;
`;

const Kept = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

interface AccountResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (kind: ResetKind) => void;
}

/** "Apagar Dados da Conta / Resetar Progresso" with an explicit, two-step confirmation. */
export function AccountResetModal({ isOpen, onClose, onConfirm }: AccountResetModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apagar dados ou resetar progresso"
      description="Escolha o que remover deste aparelho. Essa ação não pode ser desfeita."
    >
      {/* Remounts on every opening, so the choice and the typed word always start empty. */}
      <ResetForm key={String(isOpen)} onCancel={onClose} onConfirm={onConfirm} />
    </Modal>
  );
}

function ResetForm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (kind: ResetKind) => void }) {
  const [kind, setKind] = useState<ResetKind>('progress');
  const [typed, setTyped] = useState('');
  const needsWord = kind === 'everything';
  const canConfirm = !needsWord || typed.trim().toUpperCase() === CONFIRM_WORD;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canConfirm) onConfirm(kind);
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Options role="radiogroup" aria-label="O que você quer remover">
        <OptionCard<ResetKind>
          type="radio"
          name="reset-kind"
          value="progress"
          checked={kind === 'progress'}
          onSelect={setKind}
          icon={RotateCcw}
          label="Resetar progresso"
          description="Zera a Jornada 30 Dias (dias, água e conquistas) e o histórico de receitas. Perfil e preferências continuam."
        />
        <OptionCard<ResetKind>
          type="radio"
          name="reset-kind"
          value="everything"
          checked={kind === 'everything'}
          onSelect={setKind}
          icon={Trash2}
          label="Apagar dados da conta"
          description="Remove tudo deste aparelho: perfil, preferências da IA, receitas, jornada e configuração de som. Você volta para o cadastro."
        />
      </Options>

      {needsWord && (
        <Input
          label={`Para confirmar, digite ${CONFIRM_WORD}`}
          icon={KeyRound}
          name="confirm-word"
          value={typed}
          onChange={(event) => setTyped(event.target.value.slice(0, 20))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          hint="Isso evita apagar tudo sem querer."
        />
      )}

      <Kept>O tema, a verificação e o acesso comprado deste aparelho são mantidos.</Kept>

      <Actions>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" disabled={!canConfirm} leftIcon={needsWord ? <Trash2 size={18} /> : <RotateCcw size={18} />}>
          {needsWord ? 'Apagar tudo' : 'Resetar progresso'}
        </Button>
      </Actions>
    </Form>
  );
}
