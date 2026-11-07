import { useState } from 'react';
import { BadgeCheck, ChevronRight, Flame, LogOut, Pencil, RotateCcw, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { CookingLevel, DietaryRestriction, TimeAvailable } from '@/@types';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Chip } from '@/components/atoms/Chip';
import { Switch } from '@/components/atoms/Switch';
import { CheckTile } from '@/components/molecules/CheckTile';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { TagInput } from '@/components/molecules/TagInput';
import { AccountResetModal, type ResetKind } from '@/components/modals/AccountResetModal';
import { Header } from '@/components/organisms/Header';
import { Page, PageContent } from '@/components/templates/PageLayout';
import { LIMITS } from '@/constants/limits';
import { DISLIKE_SUGGESTIONS, EQUIPMENT_OPTIONS, GOAL_OPTIONS } from '@/constants/preferences';
import { COOKING_LEVEL_LABELS, COOKING_LEVEL_OPTIONS, DIETARY_OPTIONS, NO_RESTRICTION, TIME_LABELS, TIME_OPTIONS } from '@/constants/quiz';
import type { ToastOptions } from '@/context/ToastContext';
import { useAccess } from '@/hooks/useAccess';
import { useAccountReset } from '@/hooks/useAccountReset';
import { useRecipes } from '@/hooks/useRecipes';
import { useSound } from '@/hooks/useSound';
import { useToast } from '@/hooks/useToast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { maskEmail } from '@/utils/email';
import { formatCurrencyBRL, joinWithAnd } from '@/utils/format';
import { AIContextSummary } from './components/AIContextSummary';
import { AvatarSheet } from './components/AvatarSheet';
import { EditProfileSheet } from './components/EditProfileSheet';
import * as S from './styles';

const LEVEL_SEGMENTS = COOKING_LEVEL_OPTIONS.map(({ value }) => ({ value, label: COOKING_LEVEL_LABELS[value] }));
const TIME_SEGMENTS = TIME_OPTIONS.map(({ value }) => ({ value, label: TIME_LABELS[value] }));
const RESTRICTION_OPTIONS = DIETARY_OPTIONS.filter(
  (option): option is (typeof DIETARY_OPTIONS)[number] & { value: DietaryRestriction } => option.value !== NO_RESTRICTION,
);

/* Every save shares one toast id: a burst of quick edits shows a single, refreshed message. */
const SAVED_PREFERENCES: ToastOptions = {
  id: 'autosave',
  title: 'Preferências salvas',
  description: 'A IA já usa na próxima receita.',
};
const SAVED_AVATAR: ToastOptions = { id: 'autosave', title: 'Avatar atualizado', description: 'Salvo neste aparelho.' };
const SAVED_PROFILE: ToastOptions = { id: 'autosave', title: 'Dados atualizados', description: 'Salvo neste aparelho.' };

const toggleIn = <T,>(list: T[], value: T, include: boolean) =>
  include ? [...new Set([...list, value])] : list.filter((item) => item !== value);

/** "Perfil & IA": profile, avatar and every preference that shapes the recipes (auto-saved). */
export default function Profile() {
  const navigate = useNavigate();
  const { user, journey, updateProfile, setAvatar, updateQuiz, toggleAppliance, toggleGoal, setDislikedIngredients } =
    useUserProfile();
  const { history } = useRecipes();
  const { resetProgress, deleteAccountData } = useAccountReset();
  const { grant, signOut } = useAccess();
  const { isEnabled: isSoundEnabled, setEnabled: setSoundEnabled } = useSound();
  const { notify } = useToast();
  const [openSheet, setOpenSheet] = useState<'avatar' | 'edit' | 'reset' | null>(null);

  if (!user) return null;
  const { quiz, aiContext } = user;

  /** Changes are persisted by the providers right away; the toast confirms each one. */
  const autosave = (apply: () => void, message: ToastOptions = SAVED_PREFERENCES) => {
    apply();
    notify(message);
  };

  const selectedGoals = GOAL_OPTIONS.filter((option) => aiContext.goals.includes(option.value));
  const goalHint = selectedGoals.length
    ? `A IA vai priorizar ${joinWithAnd(selectedGoals.map((option) => option.description ?? option.label))}.`
    : 'Sem objetivo definido: receitas equilibradas para o dia a dia.';

  const handleReset = (kind: ResetKind) => {
    setOpenSheet(null);
    if (kind === 'progress') {
      resetProgress();
      notify({ id: 'reset', icon: RotateCcw, title: 'Progresso zerado', description: 'Sua Jornada recomeça hoje.' });
      return;
    }
    deleteAccountData();
    notify({ id: 'reset', icon: Trash2, title: 'Dados apagados', description: 'Nada ficou salvo neste aparelho.' });
    navigate('/onboarding', { replace: true });
  };

  return (
    <Page>
      <Header />
      <PageContent>
        <S.ProfileCard>
          <S.ProfileRow>
            <S.AvatarButton type="button" aria-label="Trocar avatar" aria-haspopup="dialog" onClick={() => setOpenSheet('avatar')}>
              <Avatar avatar={user.avatar} name={user.name} size={76} />
              <S.AvatarEditBadge aria-hidden="true">
                <Pencil size={13} />
              </S.AvatarEditBadge>
            </S.AvatarButton>
            <S.Identity>
              <S.Name>{user.name}</S.Name>
              <S.Email>{user.email}</S.Email>
              <S.Meta>{user.age} anos</S.Meta>
            </S.Identity>
            <Button size="sm" variant="secondary" onClick={() => setOpenSheet('edit')}>
              Editar
            </Button>
          </S.ProfileRow>

          <S.Stats aria-label="Seu progresso">
            <S.Stat>
              <dt>{history.length === 1 ? 'receita' : 'receitas'}</dt>
              <dd>{history.length}</dd>
            </S.Stat>
            <S.Stat $tone="streak">
              <dt>{journey.streak === 1 ? 'dia seguido' : 'dias seguidos'}</dt>
              <dd>
                <Flame size={16} strokeWidth={2.5} aria-hidden="true" />
                {journey.streak}
              </dd>
            </S.Stat>
            <S.Stat $tone="primary">
              <dt>economizados</dt>
              <dd>{formatCurrencyBRL(journey.totalSavings)}</dd>
            </S.Stat>
          </S.Stats>
        </S.ProfileCard>

        <AIContextSummary user={user} />

        <S.Section aria-labelledby="equipment-title">
          <S.SectionHeading>
            <h2 id="equipment-title">Na sua cozinha</h2>
            <p>Marque o que você tem: a IA monta o preparo com esses equipamentos.</p>
          </S.SectionHeading>
          <S.TileGrid>
            {EQUIPMENT_OPTIONS.map((option) => (
              <CheckTile
                key={option.value}
                label={option.label}
                icon={option.icon}
                checked={aiContext.appliances.includes(option.value)}
                onChange={() => autosave(() => toggleAppliance(option.value))}
              />
            ))}
          </S.TileGrid>
        </S.Section>

        <S.Section aria-labelledby="goals-title">
          <S.SectionHeading>
            <h2 id="goals-title">Seus objetivos</h2>
            <p>Toque para ativar um ou mais.</p>
          </S.SectionHeading>
          <S.Chips role="group" aria-labelledby="goals-title">
            {GOAL_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                icon={option.icon}
                selected={aiContext.goals.includes(option.value)}
                onToggle={() => autosave(() => toggleGoal(option.value))}
              >
                {option.label}
              </Chip>
            ))}
          </S.Chips>
          <S.Hint>{goalHint}</S.Hint>
        </S.Section>

        <S.Section>
          <TagInput
            label="Ingredientes que você não curte"
            values={aiContext.dislikedIngredients}
            onChange={(dislikedIngredients) => autosave(() => setDislikedIngredients(dislikedIngredients))}
            suggestions={DISLIKE_SUGGESTIONS}
            placeholder="Ex.: coentro"
            hint="A IA nunca vai usar esses ingredientes."
            maxItems={LIMITS.dislikedMaxItems}
            maxChars={LIMITS.dislikedMaxChars}
          />
        </S.Section>

        <S.Section aria-labelledby="cooking-profile-title">
          <S.SectionHeading>
            <h2 id="cooking-profile-title">Seu perfil culinário</h2>
            <p>As respostas do quiz, sempre editáveis.</p>
          </S.SectionHeading>
          <S.Field>
            <S.FieldLabel>Nível na cozinha</S.FieldLabel>
            <SegmentedControl<CookingLevel>
              name="profile-level"
              label="Nível na cozinha"
              options={LEVEL_SEGMENTS}
              value={quiz.cookingLevel}
              onChange={(cookingLevel) => autosave(() => updateQuiz({ cookingLevel }))}
            />
          </S.Field>
          <S.Field>
            <S.FieldLabel>Tempo por refeição</S.FieldLabel>
            <SegmentedControl<TimeAvailable>
              name="profile-time"
              label="Tempo por refeição"
              options={TIME_SEGMENTS}
              value={quiz.timeAvailable}
              onChange={(timeAvailable) => autosave(() => updateQuiz({ timeAvailable }))}
            />
          </S.Field>
          <S.Field>
            <S.FieldLabel id="restrictions-label">Restrições alimentares</S.FieldLabel>
            <S.Chips role="group" aria-labelledby="restrictions-label">
              {RESTRICTION_OPTIONS.map((option) => {
                const selected = quiz.dietaryRestrictions.includes(option.value);
                return (
                  <Chip
                    key={option.value}
                    icon={option.icon}
                    selected={selected}
                    onToggle={() =>
                      autosave(() =>
                        updateQuiz({ dietaryRestrictions: toggleIn(quiz.dietaryRestrictions, option.value, !selected) }),
                      )
                    }
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </S.Chips>
          </S.Field>
        </S.Section>

        <S.Section aria-labelledby="app-settings-title">
          <S.SectionHeading>
            <h2 id="app-settings-title">Preferências do app</h2>
            <p>Valem só para este aparelho.</p>
          </S.SectionHeading>
          <S.SettingRow>
            <S.SettingIcon $active={isSoundEnabled} aria-hidden="true">
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </S.SettingIcon>
            <S.SettingTexts>
              <strong>Sons e vibração</strong>
              <span>Efeitos sutis ao marcar passos e ingredientes, concluir dias e desbloquear conquistas.</span>
            </S.SettingTexts>
            <Switch checked={isSoundEnabled} onChange={setSoundEnabled} label="Sons e vibração" />
          </S.SettingRow>
        </S.Section>

        <S.Section aria-labelledby="privacy-title">
          <S.SectionHeading>
            <h2 id="privacy-title">Dados e privacidade</h2>
            <p>Tudo fica salvo apenas neste aparelho, e as alterações são salvas na hora.</p>
          </S.SectionHeading>
          {grant && (
            <S.SettingRow>
              <S.SettingIcon $active aria-hidden="true">
                <BadgeCheck size={20} />
              </S.SettingIcon>
              <S.SettingTexts>
                <strong>Acesso ativo</strong>
                <span>Liberado para {maskEmail(grant.email)} neste aparelho.</span>
              </S.SettingTexts>
              <Button size="sm" variant="ghost" leftIcon={<LogOut size={16} />} onClick={signOut}>
                Sair
              </Button>
            </S.SettingRow>
          )}
          <S.DangerAction type="button" aria-haspopup="dialog" onClick={() => setOpenSheet('reset')}>
            <S.DangerIcon aria-hidden="true">
              <Trash2 size={20} />
            </S.DangerIcon>
            <S.SettingTexts>
              <strong>Apagar Dados da Conta / Resetar Progresso</strong>
              <span>Você escolhe o que remover e confirma antes. Não dá para desfazer.</span>
            </S.SettingTexts>
            <ChevronRight size={18} aria-hidden="true" />
          </S.DangerAction>
        </S.Section>
      </PageContent>

      <AvatarSheet
        isOpen={openSheet === 'avatar'}
        onClose={() => setOpenSheet(null)}
        user={user}
        onSelect={(avatar) => autosave(() => setAvatar(avatar), SAVED_AVATAR)}
      />
      <EditProfileSheet
        isOpen={openSheet === 'edit'}
        onClose={() => setOpenSheet(null)}
        user={user}
        onSave={(profile) => autosave(() => updateProfile(profile), SAVED_PROFILE)}
      />
      <AccountResetModal isOpen={openSheet === 'reset'} onClose={() => setOpenSheet(null)} onConfirm={handleReset} />
    </Page>
  );
}
