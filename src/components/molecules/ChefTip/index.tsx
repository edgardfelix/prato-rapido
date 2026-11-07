import { Lightbulb } from 'lucide-react';
import * as S from './styles';

interface ChefTipProps {
  tip: string;
}

export function ChefTip({ tip }: ChefTipProps) {
  return (
    <S.Card>
      <S.IconTile aria-hidden="true">
        <Lightbulb size={20} />
      </S.IconTile>
      <S.Body>
        <S.Title>Dica do chef</S.Title>
        <S.Text>{tip}</S.Text>
      </S.Body>
    </S.Card>
  );
}
