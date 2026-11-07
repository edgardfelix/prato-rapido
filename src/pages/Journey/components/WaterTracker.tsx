import { useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { WATER_CUP_ML, WATER_GOAL_CUPS, WATER_MAX_CUPS } from '@/constants/journey';
import { useJourney } from '@/hooks/useJourney';
import { useSound } from '@/hooks/useSound';
import { waveDrift } from '@/styles/animations';
import { cardSurface, pressable } from '@/styles/mixins';
import { formatLiters } from '@/utils/format';

const Card = styled.section`
  ${cardSurface}
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Glass = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 76px;
  height: 112px;
  overflow: hidden;
  border-radius: 10px 10px 24px 24px;
  border: 2px solid ${({ theme }) => theme.colors.water};
  background: ${({ theme }) => theme.colors.waterSoft};
`;

/** Rises with translateY (compositor-only); the wave rides on its top edge. */
const Water = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.water}, color-mix(in srgb, ${({ theme }) => theme.colors.water} 70%, #000));
  transition: transform 700ms ${({ theme }) => theme.motion.easeOut};
`;

const Wave = styled.svg`
  position: absolute;
  top: -9px;
  left: 0;
  width: 200%;
  height: 10px;
  color: ${({ theme }) => theme.colors.water};
  animation: ${waveDrift} 3.2s linear infinite;
`;

const Info = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

const Amount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.5rem;
    font-weight: ${({ theme }) => theme.fontWeights.extrabold};
    color: ${({ theme }) => theme.colors.water};
  }
`;

const Volume = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Cups = styled.div`
  display: grid;
  grid-template-columns: repeat(${WATER_GOAL_CUPS}, minmax(0, 1fr));
  gap: 6px;
`;

const Cup = styled.button<{ $filled: boolean }>`
  display: grid;
  place-items: center;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme, $filled }) => ($filled ? theme.colors.waterSoft : 'transparent')};
  color: ${({ theme, $filled }) => ($filled ? theme.colors.water : theme.colors.textTertiary)};
  transition:
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut},
    color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.motion.easeOut};
  ${pressable(0.86)}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }
`;

const GlassSvg = styled.svg<{ $filled: boolean }>`
  overflow: visible;

  .water {
    fill: ${({ theme }) => theme.colors.water};
    /* Percentages relative to the rect itself: 100% drops the water out of the glass. */
    transform-box: fill-box;
    transform: translateY(${({ $filled }) => ($filled ? '0%' : '100%')});
    transition: transform 520ms ${({ theme }) => theme.motion.easeOut};
  }

  .shine {
    fill: #fff;
    opacity: ${({ $filled }) => ($filled ? 0.28 : 0)};
    transition: opacity ${({ theme }) => theme.motion.slow} ease;
  }
`;

const GLASS_PATH = 'M4 3h16l-1.8 20.4a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8Z';

/** Tumbler icon whose water rises inside it (clip-path + transform) when the cup is counted. */
function WaterGlassIcon({ filled }: { filled: boolean }) {
  const clipId = useId();
  return (
    <GlassSvg $filled={filled} viewBox="0 0 24 28" width={24} height={28} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <path d={GLASS_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect className="water" x="0" y="8" width="24" height="20" />
        <rect className="shine" x="7" y="11" width="2" height="10" rx="1" />
      </g>
      <path d={GLASS_PATH} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    </GlassSvg>
  );
}

/** Daily water tracker: 8 cups of 250 ml, a filling glass and tappable glasses that fill up. */
export function WaterTracker() {
  const titleId = useId();
  const { waterToday, setWaterToday } = useJourney();
  const { play } = useSound();
  const fill = Math.min(1, waterToday / WATER_GOAL_CUPS);

  const changeWater = (cups: number) => {
    play(cups > waterToday ? 'water' : 'uncheck');
    setWaterToday(cups);
  };
  const reachedGoal = waterToday >= WATER_GOAL_CUPS;

  return (
    <Card aria-labelledby={titleId}>
      <Top>
        <Glass aria-hidden="true">
          <Water style={{ transform: `translateY(${(1 - fill) * 100}%)` }}>
            <Wave viewBox="0 0 200 10" preserveAspectRatio="none">
              <path
                d="M0 5 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 V 10 H 0 Z"
                fill="currentColor"
              />
            </Wave>
          </Water>
        </Glass>
        <Info>
          <h2 id={titleId}>Hidratação de hoje</h2>
          <Amount aria-live="polite">
            <strong>{waterToday}</strong> de {WATER_GOAL_CUPS} copos
          </Amount>
          <Volume>
            {formatLiters(waterToday * WATER_CUP_ML)} de {formatLiters(WATER_GOAL_CUPS * WATER_CUP_ML)}
            {reachedGoal ? ' · meta batida!' : ''}
          </Volume>
          <Controls>
            <IconButton label="Remover um copo" onClick={() => changeWater(waterToday - 1)} disabled={waterToday === 0}>
              <Minus size={18} />
            </IconButton>
            <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => changeWater(waterToday + 1)} disabled={waterToday >= WATER_MAX_CUPS}>
              1 copo
            </Button>
          </Controls>
        </Info>
      </Top>

      <Cups role="group" aria-label="Copos de água de hoje">
        {Array.from({ length: WATER_GOAL_CUPS }, (_, index) => {
          const cups = index + 1;
          return (
            <Cup
              key={cups}
              type="button"
              $filled={index < waterToday}
              aria-pressed={index < waterToday}
              aria-label={cups === 1 ? '1 copo' : `${cups} copos`}
              onClick={() => changeWater(cups === waterToday ? cups - 1 : cups)}
            >
              <WaterGlassIcon filled={index < waterToday} />
            </Cup>
          );
        })}
      </Cups>
    </Card>
  );
}
