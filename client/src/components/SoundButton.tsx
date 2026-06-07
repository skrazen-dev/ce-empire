import React from 'react';
import { Button } from '@/components/ui/button';
import { useSound } from '@/contexts/SoundContext';
import type { SoundType } from '@/hooks/useSoundEffect';

type ButtonProps = React.ComponentProps<typeof Button>;

interface SoundButtonProps extends ButtonProps {
  soundType?: SoundType;
}

/**
 * SoundButton - ปุ่มที่มีเสียงเอฟเฟคในตัว
 * ใช้แทน Button ทั่วไปเพื่อให้มีเสียง
 */
export function SoundButton({
  soundType = 'click',
  onClick,
  children,
  ...props
}: SoundButtonProps) {
  const { play } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    play(soundType);
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}

export default SoundButton;
