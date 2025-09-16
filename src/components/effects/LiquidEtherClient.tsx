'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import clsx from 'clsx';
import { useReducedMotion } from '@/lib/a11y';

type LiquidEtherProps = Partial<{
  colors: string[];
  mouseForce: number;
  cursorSize: number;
  isViscous: boolean;
  viscous: number;
  iterationsViscous: number;
  iterationsPoisson: number;
  resolution: number;
  isBounce: boolean;
  autoDemo: boolean;
  autoSpeed: number;
  autoIntensity: number;
  takeoverDuration: number;
  autoResumeDelay: number;
  autoRampDuration: number;
  className: string;
}>;

type LiquidEtherComponent = ComponentType<LiquidEtherProps>;

function getEnvValue(name: string) {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? ((import.meta as ImportMeta & {
          env?: Record<string, string | boolean | undefined>;
        }).env ?? undefined)
      : undefined;
  const fallbackName = name.startsWith('NEXT_PUBLIC_')
    ? `VITE_${name.slice('NEXT_PUBLIC_'.length)}`
    : undefined;

  if (metaEnv) {
    if (metaEnv[name] !== undefined) return metaEnv[name];
    if (fallbackName && metaEnv[fallbackName] !== undefined) return metaEnv[fallbackName];
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name] !== undefined) return process.env[name];
    if (fallbackName && process.env[fallbackName] !== undefined) return process.env[fallbackName];
  }

  return undefined;
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return undefined;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function supportsWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (error) {
    return false;
  }
}

function readTokenColor(variableName: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallback;
}

export default function LiquidEtherClient(props: LiquidEtherProps) {
  const reduced = useReducedMotion();
  const [LiquidEther, setLiquidEther] = useState<LiquidEtherComponent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  const envEnabled = useMemo(() => {
    const raw = getEnvValue('NEXT_PUBLIC_LIQUIDETHER_ENABLED');
    const parsed = parseBoolean(raw);
    return parsed ?? true;
  }, []);

  const envResolution = useMemo(() => {
    const raw =
      getEnvValue('NEXT_PUBLIC_LIQUIDETHER_RESOLUTION') ??
      getEnvValue('VITE_LIQUIDETHER_RESOLUTION');
    return parseNumber(raw);
  }, []);

  const envIntensity = useMemo(() => {
    const raw =
      getEnvValue('NEXT_PUBLIC_LIQUIDETHER_INTENSITY') ??
      getEnvValue('VITE_LIQUIDETHER_INTENSITY');
    return parseNumber(raw);
  }, []);

  const defaultColors = useMemo(
    () => [
      readTokenColor('--mona-primary', '#7C3AED'),
      readTokenColor('--mona-secondary', '#0EA5E9'),
      readTokenColor('--mona-accent-pink', '#EC4899'),
    ],
    []
  );

  const fallbackBg = useMemo(
    () => ({
      background:
        'radial-gradient(1200px 600px at 70% 30%, rgba(255,255,255,0.15), transparent), linear-gradient(135deg, var(--mona-primary) 0%, var(--mona-secondary) 55%, var(--mona-accent-pink) 100%)',
    }),
    []
  );

  const mergedProps = useMemo(() => {
    const resolvedColors = props.colors?.length ? props.colors : defaultColors;
    const resolution = props.resolution ?? envResolution ?? 0.5;
    const autoIntensity = props.autoIntensity ?? envIntensity ?? 2.2;

    return {
      ...props,
      colors: resolvedColors,
      resolution,
      autoIntensity,
    } satisfies LiquidEtherProps;
  }, [defaultColors, envIntensity, envResolution, props]);

  useEffect(() => {
    if (reduced || !envEnabled) return;

    setWebglReady(supportsWebGL());
  }, [envEnabled, reduced]);

  useEffect(() => {
    if (reduced || !envEnabled) {
      setLiquidEther(null);
      return;
    }

    if (!webglReady) return;

    let cancelled = false;

    import('./vendor/LiquidEther')
      .then((module) => {
        if (!cancelled) {
          setLiquidEther(() => module.default as LiquidEtherComponent);
          setLoadError(false);
        }
      })
      .catch((error) => {
        console.error('Failed to load Liquid Ether background', error);
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [envEnabled, reduced, webglReady]);

  if (reduced || loadError || !envEnabled || !webglReady || !LiquidEther) {
    return (
      <div
        aria-hidden
        className={clsx('pointer-events-none fixed inset-0 -z-10', props.className)}
        style={fallbackBg}
      />
    );
  }

  return (
    <div className={clsx('pointer-events-none fixed inset-0 -z-10', props.className)}>
      <LiquidEther {...mergedProps} />
    </div>
  );
}

