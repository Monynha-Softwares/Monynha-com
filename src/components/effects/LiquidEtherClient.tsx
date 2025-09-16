'use client';

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '@/lib/a11y';
import type { CSSProperties } from 'react';

const LiquidEther = lazy(() => import('./vendor/LiquidEther'));

type Props = Partial<{
  enabled: boolean;
  colors: string[];
  mouseForce: number;
  cursorSize: number;
  isViscous: boolean;
  viscous: number;
  iterationsViscous: number;
  iterationsPoisson: number;
  resolution: number;
  dt: number;
  BFECC: boolean;
  isBounce: boolean;
  autoDemo: boolean;
  autoSpeed: number;
  autoIntensity: number;
  takeoverDuration: number;
  autoResumeDelay: number;
  autoRampDuration: number;
  className: string;
  style: CSSProperties;
}>;

const TRUE_STRINGS = new Set(['true', '1', 'yes', 'on']);

function parseEnvBoolean(value: unknown, fallback: boolean) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'false' || normalized === '0' || normalized === 'off') {
    return false;
  }
  if (TRUE_STRINGS.has(normalized)) {
    return true;
  }
  return fallback;
}

function parseEnvNumber(value: unknown, fallback?: number) {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function LiquidEtherClient(props: Props) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallbackBg = useMemo(
    () => ({
      background:
        'radial-gradient(1200px 600px at 70% 30%, rgba(255,255,255,0.15), transparent), linear-gradient(135deg, var(--mona-primary) 0%, var(--mona-secondary) 55%, #EC4899 100%)',
    }),
    []
  );

  const env = import.meta.env;
  const enabledEnv = parseEnvBoolean(
    (env.NEXT_PUBLIC_LIQUIDETHER_ENABLED ?? env.VITE_LIQUIDETHER_ENABLED) as string | undefined,
    true
  );
  const isEnabled = props.enabled ?? enabledEnv;

  const resolutionEnv = parseEnvNumber(
    env.NEXT_PUBLIC_LIQUIDETHER_RESOLUTION ?? env.VITE_LIQUIDETHER_RESOLUTION,
    undefined
  );
  const intensityEnv = parseEnvNumber(
    env.NEXT_PUBLIC_LIQUIDETHER_INTENSITY ?? env.VITE_LIQUIDETHER_INTENSITY,
    undefined
  );

  const resolution = props.resolution ?? resolutionEnv ?? 0.5;
  const autoIntensity = props.autoIntensity ?? intensityEnv ?? 2.2;

  if (!mounted || reduced || !isEnabled) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 -z-10 ${props.className ?? ''}`}
        style={{ ...fallbackBg, ...props.style }}
      />
    );
  }

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 ${props.className ?? ''}`} style={props.style}>
      <Suspense fallback={null}>
        <LiquidEther
          colors={props.colors ?? ['#7C3AED', '#0EA5E9', '#EC4899']}
          mouseForce={props.mouseForce ?? 20}
          cursorSize={props.cursorSize ?? 100}
          isViscous={props.isViscous ?? false}
          viscous={props.viscous ?? 30}
          iterationsViscous={props.iterationsViscous ?? 32}
          iterationsPoisson={props.iterationsPoisson ?? 32}
          resolution={resolution}
          dt={props.dt ?? 0.014}
          BFECC={props.BFECC ?? true}
          isBounce={props.isBounce ?? false}
          autoDemo={props.autoDemo ?? true}
          autoSpeed={props.autoSpeed ?? 0.5}
          autoIntensity={autoIntensity}
          takeoverDuration={props.takeoverDuration ?? 0.25}
          autoResumeDelay={props.autoResumeDelay ?? 3000}
          autoRampDuration={props.autoRampDuration ?? 0.6}
        />
      </Suspense>
    </div>
  );
}
