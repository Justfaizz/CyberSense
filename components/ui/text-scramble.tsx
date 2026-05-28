'use client';
import { type JSX, useEffect, useState, useRef, memo, useMemo } from 'react';
import { motion, MotionProps } from 'framer-motion';

type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
} & MotionProps;

const defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const TextScramble = memo(function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = 'p',
  trigger = true,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  // Memoize the motion-wrapped component so it isn't recreated on every render
  const MotionComponent = useMemo(
    () => motion.create(Component as keyof JSX.IntrinsicElements),
    [Component]
  );
  const [displayText, setDisplayText] = useState(children);
  const isAnimatingRef = useRef(false);
  const text = children;

  useEffect(() => {
    if (!trigger) return;
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const steps = duration / speed;
    let step = 0;
    const charLen = characterSet.length;

    const interval = setInterval(() => {
      const progress = step / steps;
      let scrambled = '';

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') { scrambled += ' '; continue; }
        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * charLen)];
        }
      }

      setDisplayText(scrambled);
      step++;

      if (step > steps) {
        clearInterval(interval);
        setDisplayText(text);
        isAnimatingRef.current = false;
        onScrambleComplete?.();
      }
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MotionComponent className={className} {...props}>
      {displayText}
    </MotionComponent>
  );
});
