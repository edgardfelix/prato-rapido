import { Bot, ShieldCheck } from 'lucide-react';
import styled from 'styled-components';
import type { User } from '@/@types';
import { EQUIPMENT_LABELS, GOAL_LABELS } from '@/constants/preferences';
import { COOKING_LEVEL_LABELS, DIETARY_LABELS, TIME_LABELS } from '@/constants/quiz';
import { joinWithAnd } from '@/utils/format';

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.primarySoft};
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
`;

const Heading = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Lines = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};

  li {
    position: relative;
    padding-left: 14px;
  }

  li::before {
    content: '';
    position: absolute;
    top: 0.6em;
    left: 0;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }

  b {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Privacy = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Plain-language preview of exactly what is added to every recipe prompt. */
export function AIContextSummary({ user }: { user: User }) {
  const { quiz, aiContext } = user;
  const restrictions = quiz.dietaryRestrictions.map((item) => DIETARY_LABELS[item]);
  const equipment = aiContext.appliances.map((item) => EQUIPMENT_LABELS[item]);
  const goals = aiContext.goals.map((item) => GOAL_LABELS[item]);

  return (
    <Card aria-labelledby="ai-context-title">
      <Heading id="ai-context-title">
        <Bot size={18} aria-hidden="true" /> Como a IA vê você
      </Heading>
      <Lines>
        <li>
          {user.age} anos · {COOKING_LEVEL_LABELS[quiz.cookingLevel]} · {TIME_LABELS[quiz.timeAvailable]} por refeição
        </li>
        <li>
          <b>Restrições:</b> {restrictions.length ? joinWithAnd(restrictions) : 'nenhuma'}
        </li>
        <li>
          <b>Na cozinha:</b> {equipment.length ? joinWithAnd(equipment) : 'não informado (cozinha padrão)'}
        </li>
        <li>
          <b>Objetivos:</b> {goals.length ? joinWithAnd(goals) : 'nenhum em especial'}
        </li>
        <li>
          <b>Nunca usar:</b>{' '}
          {aiContext.dislikedIngredients.length ? joinWithAnd(aiContext.dislikedIngredients) : 'nada por enquanto'}
        </li>
      </Lines>
      <Privacy>
        <ShieldCheck size={14} aria-hidden="true" /> Nome, e-mail e foto nunca são enviados para a IA.
      </Privacy>
    </Card>
  );
}
