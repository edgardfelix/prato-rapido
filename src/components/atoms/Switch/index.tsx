import * as S from './styles';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name; render a visible label next to it as well. */
  label: string;
  disabled?: boolean;
}

/** On/off switch (role="switch"). */
export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <S.Track
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      $checked={checked}
      onClick={() => onChange(!checked)}
    >
      <S.Thumb $checked={checked} />
    </S.Track>
  );
}
