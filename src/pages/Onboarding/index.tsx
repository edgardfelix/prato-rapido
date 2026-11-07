import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ChefHat, Check } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import type { CookingLevel, DietaryRestriction, TimeAvailable, User } from '@/@types';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { StepProgress } from '@/components/molecules/StepProgress';
import { Header } from '@/components/organisms/Header';
import { Page } from '@/components/templates/PageLayout';
import {
  COOKING_LEVEL_OPTIONS,
  DIETARY_OPTIONS,
  NO_RESTRICTION,
  TIME_OPTIONS,
  type DietaryChoice,
} from '@/constants/quiz';
import { useAccess } from '@/hooks/useAccess';
import { useUser } from '@/hooks/useUser';
import { ChoiceStep } from './steps/ChoiceStep';
import { ProfileStep } from './steps/ProfileStep';
import * as S from './styles';
import {
  hasErrors,
  PROFILE_FIELDS,
  validateProfile,
  type ProfileDraft,
  type ProfileField,
} from '@/utils/profileValidation';

const STEP_LABELS = ['Seu perfil', 'Nível na cozinha', 'Restrições', 'Tempo disponível'] as const;
const LAST_STEP = STEP_LABELS.length - 1;

interface QuizDraft {
  cookingLevel: CookingLevel | null;
  dietaryRestrictions: DietaryRestriction[];
  timeAvailable: TimeAvailable | null;
}

/** Route entry: first-time onboarding, or profile editing via `/onboarding?editar`. */
export default function Onboarding() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const isEditing = user !== null && searchParams.has('editar');

  if (user && !isEditing) return <Navigate to="/" replace />;
  return <OnboardingFlow initialUser={isEditing ? user : null} />;
}

function OnboardingFlow({ initialUser }: { initialUser: User | null }) {
  const navigate = useNavigate();
  const { saveUser } = useUser();
  const { grant } = useAccess();
  const isEditing = initialUser !== null;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [profile, setProfile] = useState<ProfileDraft>(() => ({
    name: initialUser?.name ?? '',
    age: initialUser ? String(initialUser.age) : '',
    // Buyers already typed their purchase e-mail on the activation screen.
    email: initialUser?.email ?? grant?.email ?? '',
  }));
  const [touched, setTouched] = useState<Record<ProfileField, boolean>>({ name: false, age: false, email: false });
  const [quiz, setQuiz] = useState<QuizDraft>(() => ({
    cookingLevel: initialUser?.quiz.cookingLevel ?? null,
    dietaryRestrictions: initialUser?.quiz.dietaryRestrictions ?? [],
    timeAvailable: initialUser?.quiz.timeAvailable ?? null,
  }));

  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedRef = useRef(false);
  const errors = useMemo(() => validateProfile(profile), [profile]);

  // Moves focus to the new step title so screen readers announce it.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const stepIsValid = [
    !hasErrors(errors),
    quiz.cookingLevel !== null,
    true,
    quiz.timeAvailable !== null,
  ][step];

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  const goBack = () => {
    if (step === 0) navigate('/', { replace: true });
    else goTo(step - 1);
  };

  const finish = () => {
    if (!quiz.cookingLevel || !quiz.timeAvailable) return;
    saveUser(
      {
        name: profile.name.trim().replace(/\s+/g, ' '),
        age: Number(profile.age),
        email: profile.email.trim().toLowerCase(),
      },
      {
        cookingLevel: quiz.cookingLevel,
        dietaryRestrictions: quiz.dietaryRestrictions,
        timeAvailable: quiz.timeAvailable,
      },
    );
    navigate('/', { replace: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 0 && hasErrors(errors)) {
      setTouched({ name: true, age: true, email: true });
      const firstInvalid = PROFILE_FIELDS.find((field) => errors[field]);
      if (firstInvalid) event.currentTarget.querySelector<HTMLInputElement>(`input[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (!stepIsValid) return;
    if (step < LAST_STEP) goTo(step + 1);
    else finish();
  };

  const toggleRestriction = (value: DietaryChoice) => {
    setQuiz((current) => {
      if (value === NO_RESTRICTION) return { ...current, dietaryRestrictions: [] };
      const isSelected = current.dietaryRestrictions.includes(value);
      return {
        ...current,
        dietaryRestrictions: isSelected
          ? current.dietaryRestrictions.filter((item) => item !== value)
          : [...current.dietaryRestrictions, value],
      };
    });
  };

  const isRestrictionSelected = (value: DietaryChoice) =>
    value === NO_RESTRICTION ? quiz.dietaryRestrictions.length === 0 : quiz.dietaryRestrictions.includes(value);

  const isLastStep = step === LAST_STEP;
  const submitLabel = isLastStep ? (isEditing ? 'Salvar alterações' : 'Começar a cozinhar') : 'Continuar';
  const submitIcon = isLastStep ? isEditing ? <Check size={20} /> : <ChefHat size={20} /> : <ArrowRight size={20} />;
  const canGoBack = step > 0 || isEditing;

  return (
    <Page>
      <Header
        showBrand={step > 0}
        leading={
          canGoBack ? (
            <IconButton variant="ghost" label={step === 0 ? 'Cancelar edição' : 'Voltar'} onClick={goBack}>
              <ArrowLeft size={20} />
            </IconButton>
          ) : undefined
        }
      />

      <S.Form onSubmit={handleSubmit} noValidate>
        <S.Content>
          <StepProgress current={step + 1} total={STEP_LABELS.length} label={STEP_LABELS[step] ?? ''} />

          <S.StepViewport key={step} $direction={direction}>
            {step === 0 && (
              <ProfileStep
                headingRef={headingRef}
                draft={profile}
                errors={errors}
                touched={touched}
                isEditing={isEditing}
                onChange={(field, value) => setProfile((current) => ({ ...current, [field]: value }))}
                onBlur={(field) => setTouched((current) => ({ ...current, [field]: true }))}
              />
            )}
            {step === 1 && (
              <ChoiceStep
                headingRef={headingRef}
                heading="Qual é o seu nível na cozinha?"
                description="Assim as receitas chegam com o nível de detalhe certo para você."
                type="radio"
                name="cookingLevel"
                options={COOKING_LEVEL_OPTIONS}
                isSelected={(value) => quiz.cookingLevel === value}
                onSelect={(value) => setQuiz((current) => ({ ...current, cookingLevel: value }))}
              />
            )}
            {step === 2 && (
              <ChoiceStep
                headingRef={headingRef}
                heading="Alguma restrição alimentar?"
                description="Marque quantas quiser. Nenhuma receita vai incluir o que você evita."
                type="checkbox"
                name="dietaryRestrictions"
                options={DIETARY_OPTIONS}
                isSelected={isRestrictionSelected}
                onSelect={toggleRestriction}
              />
            )}
            {step === 3 && (
              <ChoiceStep
                headingRef={headingRef}
                heading="Quanto tempo você costuma ter?"
                description="Vamos priorizar receitas que cabem na sua rotina."
                type="radio"
                name="timeAvailable"
                options={TIME_OPTIONS}
                isSelected={(value) => quiz.timeAvailable === value}
                onSelect={(value) => setQuiz((current) => ({ ...current, timeAvailable: value }))}
              />
            )}
          </S.StepViewport>
        </S.Content>

        <S.Footer>
          <Button type="submit" size="lg" fullWidth disabled={step > 0 && !stepIsValid} rightIcon={submitIcon}>
            {submitLabel}
          </Button>
        </S.Footer>
      </S.Form>
    </Page>
  );
}
