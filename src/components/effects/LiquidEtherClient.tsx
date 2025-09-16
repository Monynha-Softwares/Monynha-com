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

const BRAND_COLORS = ['#7C3AED', '#0EA5E9', '#EC4899'] as const;

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

function parseColorList(value: unknown) {
  if (typeof value !== 'string') return undefined;

  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return entries.length > 0 ? entries : undefined;
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

  const envColors = useMemo(() => {
    const raw =
      getEnvValue('NEXT_PUBLIC_LIQUIDETHER_COLORS') ??
      getEnvValue('VITE_LIQUIDETHER_COLORS');
    return parseColorList(raw);
  }, []);

  const tokenColors = useMemo(
    () => [
      readTokenColor('--mona-primary', BRAND_COLORS[0]),
      readTokenColor('--mona-secondary', BRAND_COLORS[1]),
      readTokenColor('--mona-accent-pink', BRAND_COLORS[2]),
    ],
    []
  );

  const paletteForFallback = useMemo(() => {
    const activePalette = envColors && envColors.length > 0 ? envColors : tokenColors;
    const fallbackPalette = activePalette.length > 0 ? activePalette : [...BRAND_COLORS];

    return [...fallbackPalette, ...BRAND_COLORS].slice(0, 3);
  }, [envColors, tokenColors]);

  const fallbackBg = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${paletteForFallback[0]} 0%, ${
        paletteForFallback[1] ?? paletteForFallback[0]
      } 55%, ${paletteForFallback[2] ?? paletteForFallback[1] ?? paletteForFallback[0]} 100%)`,
    }),
    [paletteForFallback]
  );

  const mergedProps = useMemo(() => {
    const colorSource = props.colors?.length
      ? props.colors
      : envColors?.length
      ? envColors
      : tokenColors;
    const resolvedColors = Array.isArray(colorSource) ? [...colorSource] : [...BRAND_COLORS];
    const resolution = props.resolution ?? envResolution ?? 0.5;
    const autoIntensity = props.autoIntensity ?? envIntensity ?? 2.2;

    return {
      ...props,
      colors: resolvedColors,
      resolution,
      autoIntensity,
    } satisfies LiquidEtherProps;
  }, [envColors, envIntensity, envResolution, props, tokenColors]);

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

