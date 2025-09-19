'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import clsx from 'clsx';

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

function getPrefersReducedMotion() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(getPrefersReducedMotion);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setPrefersReduced(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReduced;
}

const MAX_COLORS = 6;

function getEnvValue(name: string) {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? ((
          import.meta as ImportMeta & {
            env?: Record<string, string | boolean | undefined>;
          }
        ).env ?? undefined)
      : undefined;
  const fallbackName = name.startsWith('NEXT_PUBLIC_')
    ? `VITE_${name.slice('NEXT_PUBLIC_'.length)}`
    : undefined;

  if (metaEnv) {
    if (metaEnv[name] !== undefined) return metaEnv[name];
    if (fallbackName && metaEnv[fallbackName] !== undefined)
      return metaEnv[fallbackName];
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name] !== undefined) return process.env[name];
    if (fallbackName && process.env[fallbackName] !== undefined)
      return process.env[fallbackName];
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
  const sanitizeList = (list: unknown[]) =>
    list
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
      .slice(0, MAX_COLORS);

  if (Array.isArray(value)) {
    const colors = sanitizeList(value);
    return colors.length ? colors : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const colors = sanitizeList(parsed);
          if (colors.length) return colors;
        }
      } catch (error) {
        console.warn('Invalid NEXT_PUBLIC_LIQUIDETHER_COLORS value', error);
      }
    }

    const colors = sanitizeList(trimmed.split(','));
    return colors.length ? colors : undefined;
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
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return value || fallback;
}

export default function LiquidEtherClient(props: LiquidEtherProps) {
  const reduced = usePrefersReducedMotion();
  const [LiquidEther, setLiquidEther] = useState<LiquidEtherComponent | null>(
    null
  );
  const [loadError, setLoadError] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  const envEnabled = useMemo(() => {
    const raw = getEnvValue('NEXT_PUBLIC_LIQUIDETHER_ENABLED');
    const parsed = parseBoolean(raw);
    return parsed ?? true;
  }, []);

  const envColors = useMemo(() => {
    const raw =
      getEnvValue('NEXT_PUBLIC_LIQUIDETHER_COLORS') ??
      getEnvValue('VITE_LIQUIDETHER_COLORS');
    return parseColorList(raw);
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

  const defaultColors = useMemo(() => {
    if (envColors?.length) {
      return envColors;
    }

    return [
      readTokenColor('--mona-primary', '#7C3AED'),
      readTokenColor('--mona-secondary', '#0EA5E9'),
      readTokenColor('--mona-accent-pink', '#EC4899'),
    ];
  }, [envColors]);

  const fallbackBg = useMemo(() => {
    const colors = props.colors?.length ? props.colors : defaultColors;
    const primary = colors[0] ?? '#7C3AED';
    const secondary = colors[1] ?? primary;
    const accent = colors[2] ?? secondary;

    return {
      background: `radial-gradient(1200px 600px at 70% 30%, rgba(255,255,255,0.16), transparent), linear-gradient(135deg, ${primary} 0%, ${secondary} 55%, ${accent} 100%)`,
    };
  }, [defaultColors, props.colors]);

  const resolvedColors = props.colors?.length ? props.colors : defaultColors;
  const resolution = props.resolution ?? envResolution ?? 0.5;
  const autoIntensity = props.autoIntensity ?? envIntensity ?? 2.2;

  const mergedProps = {
    ...props,
    colors: resolvedColors,
    resolution,
    autoIntensity,
  } satisfies LiquidEtherProps;

  useEffect(() => {
    if (reduced || !envEnabled) {
      setWebglReady(false);
      return;
    }

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
        className={clsx(
          'pointer-events-none fixed inset-0 -z-10',
          props.className
        )}
        style={fallbackBg}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none fixed inset-0 -z-10',
        props.className
      )}
    >
      <LiquidEther {...mergedProps} />
    </div>
  );
}
