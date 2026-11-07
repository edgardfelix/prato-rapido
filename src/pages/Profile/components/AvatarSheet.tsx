import { useId, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Check, Trash2 } from 'lucide-react';
import styled from 'styled-components';
import type { AvatarChoice, User } from '@/@types';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { InlineAlert } from '@/components/molecules/InlineAlert';
import { Modal } from '@/components/organisms/Modal';
import { AVATAR_GROUPS, AVATAR_ICONS } from '@/constants/avatars';
import { LIMITS } from '@/constants/limits';
import { popIn } from '@/styles/animations';
import { pressable, visuallyHidden } from '@/styles/mixins';
import { compressImage } from '@/utils/image';

const AVATAR_SIZE = 44;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GroupTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
`;

/** Full grid cell as the tap target; the avatar inside stays a fixed size. */
const Cell = styled.button`
  display: grid;
  place-items: center;
  height: 54px;
  border-radius: ${({ theme }) => theme.radii.md};
  ${pressable(0.9)}

  &:disabled {
    cursor: progress;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
  }
`;

const Ring = styled.span<{ $selected: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow:
    0 0 0 2px ${({ theme }) => theme.colors.surface},
    0 0 0 4px ${({ theme, $selected }) => ($selected ? theme.colors.primary : 'transparent')};
  transition: box-shadow ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};
`;

const SelectedBadge = styled.span`
  position: absolute;
  right: -5px;
  bottom: -5px;
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.surface};
  animation: ${popIn} 320ms ${({ theme }) => theme.motion.easeOut} both;
`;

const CameraCircle = styled.span`
  display: grid;
  place-items: center;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1.5px dashed ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Note = styled.p`
  margin-top: 14px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-align: center;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const HiddenInput = styled.input`
  ${visuallyHidden}
`;

function isSameAvatar(a: AvatarChoice, b: AvatarChoice): boolean {
  if (a.kind === 'icon' && b.kind === 'icon') return a.icon === b.icon;
  if (a.kind === 'photo' && b.kind === 'photo') return a.dataUrl === b.dataUrl;
  return a.kind === b.kind;
}

function SelectedMark() {
  return (
    <SelectedBadge aria-hidden="true">
      <Check size={11} strokeWidth={3.5} />
    </SelectedBadge>
  );
}

interface AvatarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSelect: (avatar: AvatarChoice) => void;
}

/** Avatar picker: gourmet and tech presets, the user's initials or a photo (kept on the device). */
export function AvatarSheet({ isOpen, onClose, user, onSelect }: AvatarSheetProps) {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { avatar } = user;

  const choose = (next: AvatarChoice) => {
    if (!isSameAvatar(avatar, next)) onSelect(next);
    setError(null);
    onClose();
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const image = await compressImage(file, { maxDimension: LIMITS.avatarMaxDimension, quality: 0.8 });
      choose({ kind: 'photo', dataUrl: image.previewUrl });
    } catch {
      setError('Não consegui usar essa foto. Tente outra imagem em JPG ou PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escolha seu avatar" description="Ele aparece no seu perfil e na tela inicial.">
      <Groups>
        {AVATAR_GROUPS.map((group) => (
          <Group key={group.id} aria-labelledby={`${baseId}-${group.id}`}>
            <GroupTitle id={`${baseId}-${group.id}`}>{group.label}</GroupTitle>
            <Grid>
              {AVATAR_ICONS.filter((option) => option.group === group.id).map((option) => {
                const isSelected = avatar.kind === 'icon' && avatar.icon === option.id;
                return (
                  <Cell
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={isSelected}
                    title={option.label}
                    onClick={() => choose({ kind: 'icon', icon: option.id })}
                  >
                    <Ring $selected={isSelected}>
                      <Avatar avatar={{ kind: 'icon', icon: option.id }} name={user.name} size={AVATAR_SIZE} />
                      {isSelected && <SelectedMark />}
                    </Ring>
                  </Cell>
                );
              })}
            </Grid>
          </Group>
        ))}

        <Group aria-labelledby={`${baseId}-personal`}>
          <GroupTitle id={`${baseId}-personal`}>Iniciais ou foto</GroupTitle>
          <Grid>
            <Cell
              type="button"
              aria-label="Usar minhas iniciais"
              aria-pressed={avatar.kind === 'initials'}
              title="Iniciais"
              onClick={() => choose({ kind: 'initials' })}
            >
              <Ring $selected={avatar.kind === 'initials'}>
                <Avatar avatar={{ kind: 'initials' }} name={user.name} size={AVATAR_SIZE} />
                {avatar.kind === 'initials' && <SelectedMark />}
              </Ring>
            </Cell>
            {avatar.kind === 'photo' ? (
              <Cell type="button" aria-label="Sua foto" aria-pressed title="Sua foto" onClick={() => choose(avatar)}>
                <Ring $selected>
                  <Avatar avatar={avatar} name={user.name} size={AVATAR_SIZE} />
                  <SelectedMark />
                </Ring>
              </Cell>
            ) : (
              <Cell
                type="button"
                aria-label="Usar uma foto"
                title="Usar uma foto"
                disabled={isProcessing}
                aria-busy={isProcessing}
                onClick={openFilePicker}
              >
                <CameraCircle>
                  <Camera size={18} aria-hidden="true" />
                </CameraCircle>
              </Cell>
            )}
          </Grid>
        </Group>
      </Groups>

      {avatar.kind === 'photo' && (
        <Actions>
          <Button variant="secondary" size="sm" leftIcon={<Camera size={16} />} isLoading={isProcessing} onClick={openFilePicker}>
            Trocar foto
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => choose({ kind: 'initials' })}>
            Remover foto
          </Button>
        </Actions>
      )}

      {error && (
        <Actions>
          <InlineAlert tone="error">{error}</InlineAlert>
        </Actions>
      )}

      <HiddenInput ref={fileInputRef} type="file" accept="image/*" tabIndex={-1} aria-hidden="true" onChange={handleFile} />
      <Note>Fotos ficam salvas só neste aparelho e nunca são enviadas para a IA.</Note>
    </Modal>
  );
}
