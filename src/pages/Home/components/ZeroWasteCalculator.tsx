import { useId, useState, type CSSProperties } from 'react';
import { Minus, Plus, Recycle, Refrigerator } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { SAVINGS_PER_MEAL_BRL } from '@/constants/journey';
import { WASTE_DEFAULT_ITEMS, WASTE_ITEM_VALUE_BRL, WASTE_MAX_ITEMS } from '@/constants/zeroWaste';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { cardSurface, visuallyHidden } from '@/styles/mixins';
import { formatCurrencyBRL, formatCurrencyBRLPrecise } from '@/utils/format';
import { estimateWaste } from '@/utils/zeroWaste';

const Card = styled.section`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconTile = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Eyebrow = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const Question = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

/** Native range input (keyboard + screen readers for free), restyled for both themes. */
const Slider = styled.input`
  flex: 1;
  min-width: 0;
  height: 32px;
  appearance: none;
  background: transparent;
  cursor: pointer;
  touch-action: pan-y;

  &::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colors.primary} var(--fill),
      ${({ theme }) => theme.colors.surfaceRaised} var(--fill)
    );
  }

  &::-webkit-slider-thumb {
    width: 26px;
    height: 26px;
    margin-top: -9px;
    appearance: none;
    border-radius: ${({ theme }) => theme.radii.full};
    border: 3px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    transition: transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.motion.easeOut};
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  &::-moz-range-track {
    height: 8px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  &::-moz-range-progress {
    height: 8px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.primary};
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: ${({ theme }) => theme.radii.full};
    border: 3px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 4px;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const Count = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.5rem;
    font-weight: ${({ theme }) => theme.fontWeights.extrabold};
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Result = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.snug};
`;

const Loss = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.danger};
`;

const Gain = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primary};
`;

const Footnote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const LiveRegion = styled.span`
  ${visuallyHidden}
`;

const plural = (count: number, singular: string, pluralForm: string) => (count === 1 ? singular : pluralForm);

/** Count-up text kept in its own component, so only it re-renders per animation frame. */
function AnimatedValue({ value, format }: { value: number; format: (value: number) => string }) {
  return <>{format(useAnimatedNumber(value, { durationMs: 450 }))}</>;
}

interface ZeroWasteCalculatorProps {
  /** Selects "Limpa Geladeira" and brings the composer into view. */
  onUseFridgeCleanup: () => void;
}

/** "Desperdício Zero": how much food money goes to the trash, and how fast home cooking pays it back. */
export function ZeroWasteCalculator({ onUseFridgeCleanup }: ZeroWasteCalculatorProps) {
  const titleId = useId();
  const sliderId = useId();
  const [items, setItems] = useState(WASTE_DEFAULT_ITEMS);
  const { monthlyLoss, recoveryDays } = estimateWaste(items);
  const fill = `${(items / WASTE_MAX_ITEMS) * 100}%`;
  const itemsLabel = plural(items, 'item', 'itens');

  const summary =
    monthlyLoss > 0
      ? `Você perde cerca de ${formatCurrencyBRL(monthlyLoss)} por mês no lixo. O Prato Rápido recupera esse valor em ${recoveryDays} ${plural(recoveryDays, 'dia', 'dias')}.`
      : 'Quase nada vai para o lixo. Continue assim!';

  return (
    <Card aria-labelledby={titleId}>
      <Header>
        <IconTile aria-hidden="true">
          <Recycle size={22} />
        </IconTile>
        <div>
          <Eyebrow>Calculadora Desperdício Zero</Eyebrow>
          <Title id={titleId}>Quanto vai para o lixo?</Title>
        </div>
      </Header>

      <Question htmlFor={sliderId}>Quantos itens de comida você joga fora por semana?</Question>
      <SliderRow>
        <IconButton label="Menos um item" onClick={() => setItems((current) => Math.max(0, current - 1))} disabled={items === 0}>
          <Minus size={18} />
        </IconButton>
        <Slider
          id={sliderId}
          type="range"
          min={0}
          max={WASTE_MAX_ITEMS}
          step={1}
          value={items}
          onChange={(event) => setItems(Number(event.target.value))}
          aria-valuetext={`${items} ${itemsLabel} por semana`}
          style={{ '--fill': fill } as CSSProperties}
        />
        <IconButton
          label="Mais um item"
          onClick={() => setItems((current) => Math.min(WASTE_MAX_ITEMS, current + 1))}
          disabled={items === WASTE_MAX_ITEMS}
        >
          <Plus size={18} />
        </IconButton>
      </SliderRow>
      <Count aria-hidden="true">
        <strong>{items}</strong> {itemsLabel} por semana
      </Count>

      {/* Visible numbers count up; screen readers get the final sentence once. */}
      <Result aria-hidden="true">
        {monthlyLoss > 0 ? (
          <>
            <p>
              Você perde cerca de <Loss><AnimatedValue value={monthlyLoss} format={formatCurrencyBRL} />/mês</Loss> no lixo.
            </p>
            <p>
              O Prato Rápido recupera esse valor em{' '}
              <Gain>
                <AnimatedValue value={recoveryDays} format={(days) => `${days} ${plural(days, 'dia', 'dias')}`} />
              </Gain>
              .
            </p>
          </>
        ) : (
          <p>Quase nada vai para o lixo. Continue assim! 🌱</p>
        )}
      </Result>
      <LiveRegion aria-live="polite">{summary}</LiveRegion>

      <Button variant="secondary" fullWidth leftIcon={<Refrigerator size={18} />} onClick={onUseFridgeCleanup}>
        Usar o Limpa Geladeira agora
      </Button>
      <Footnote>
        Estimativa: {formatCurrencyBRLPrecise(WASTE_ITEM_VALUE_BRL)} por item descartado e {formatCurrencyBRL(SAVINGS_PER_MEAL_BRL)}{' '}
        economizados por refeição feita em casa em vez de delivery (os mesmos da Jornada).
      </Footnote>
    </Card>
  );
}
