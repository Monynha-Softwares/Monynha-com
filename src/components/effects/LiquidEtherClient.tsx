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

function parseColorList(value: unknown) {
  if (Array.isArray(value)) {
    const colors = value.map((entry) => `${entry}`.trim()).filter(Boolean);
    return colors.length ? colors : undefined;
  }

  if (typeof value !== 'string') return undefined;

  const colors = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return colors.length ? colors.slice(0, 6) : undefined;
}

function clampResolution(value: number | undefined) {
  if (!Number.isFinite(value ?? Number.NaN)) return undefined;
  return Math.min(0.6, Math.max(0.3, value!));
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

  const envColors = useMemo(() => {
    const raw = getEnvValue('NEXT_PUBLIC_LIQUIDETHER_COLORS');
    return parseColorList(raw);
  }, []);

  const resolvedColors = useMemo(() => {
    if (props.colors?.length) return props.colors;
    if (envColors?.length) return envColors;
    return defaultColors;
  }, [defaultColors, envColors, props.colors]);

  const fallbackBg = useMemo(() => {
    const palette = [
      resolvedColors[0] ?? defaultColors[0],
      resolvedColors[1] ?? resolvedColors[0] ?? defaultColors[1],
      resolvedColors[2] ?? resolvedColors[1] ?? defaultColors[2],
    ];

    return {
      background: `radial-gradient(1200px 600px at 70% 30%, rgba(255,255,255,0.15), transparent), linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 55%, ${palette[2]} 100%)`,
    };
  }, [defaultColors, resolvedColors]);

  const mergedProps = useMemo(() => {
    const resolution =
      clampResolution(props.resolution) ?? clampResolution(envResolution) ?? 0.5;
    const autoIntensity = props.autoIntensity ?? envIntensity ?? 2.2;

    return {
      ...props,
      colors: resolvedColors,
      resolution,
      autoIntensity,
    } satisfies LiquidEtherProps;
  }, [envIntensity, envResolution, props, resolvedColors]);

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

