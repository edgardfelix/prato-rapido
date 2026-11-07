import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '@/components/atoms/IconButton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import * as S from './styles';

const EXIT_DURATION_MS = 220;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Accessible bottom sheet: portal, focus trap, Escape to close, scroll lock,
 * focus restoration and enter/exit animations (transform only).
 */
export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  // Derive mount/exit state from the prop during render (no effect round-trip).
  if (isOpen !== previousIsOpen) {
    setPreviousIsOpen(isOpen);
    if (isOpen) {
      setIsMounted(true);
      setIsClosing(false);
    } else if (isMounted) {
      setIsClosing(true);
    }
  }

  useEffect(() => {
    if (!isClosing) return;
    const timer = window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
    }, EXIT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isClosing]);

  if (!isMounted) return null;

  return createPortal(
    <ModalSheet title={title} description={description} onClose={onClose} isClosing={isClosing}>
      {children}
    </ModalSheet>,
    document.body,
  );
}

interface ModalSheetProps extends Omit<ModalProps, 'isOpen'> {
  isClosing: boolean;
}

function ModalSheet({ title, description, onClose, isClosing, children }: ModalSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  useFocusTrap(sheetRef, onClose);
  useScrollLock();

  const state = isClosing ? 'closed' : 'open';

  return (
    <>
      <S.Backdrop $state={state} onClick={onClose} aria-hidden="true" />
      <S.Positioner>
        <S.Sheet
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          $state={state}
        >
          <S.Handle aria-hidden="true" />
          <S.SheetHeader>
            <S.Title id={titleId}>{title}</S.Title>
            <IconButton size="sm" variant="ghost" label="Fechar" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </S.SheetHeader>
          {description && <S.Description id={descriptionId}>{description}</S.Description>}
          <S.Body>{children}</S.Body>
        </S.Sheet>
      </S.Positioner>
    </>
  );
}
