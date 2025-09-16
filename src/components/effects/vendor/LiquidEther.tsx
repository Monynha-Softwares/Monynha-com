import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import clsx from 'clsx';

type Props = {
  colors?: string[];
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  resolution?: number;
  isBounce?: boolean;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
  className?: string;
};

const MAX_COLORS = 6;
const DEFAULT_COLORS = ['#7C3AED', '#0EA5E9', '#EC4899'];

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uCursorSize;
  uniform float uIntensity;
  uniform vec3 uColors[${MAX_COLORS}];
  uniform int uColorCount;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rot = rotate2d(0.5);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rot * p * 2.0;
      amplitude *= 0.55;
    }

    return value;
  }

  vec3 fetchColor(int index) {
    if (index <= 0) {
      return uColors[0];
    } else if (index == 1) {
      return uColors[1];
    } else if (index == 2) {
      return uColors[2];
    } else if (index == 3) {
      return uColors[3];
    } else if (index == 4) {
      return uColors[4];
    }
    return uColors[5];
  }

  vec3 sampleGradient(float t) {
    if (uColorCount <= 1) {
      return fetchColor(0);
    }

    float scaled = clamp(t, 0.0, 0.9999) * float(uColorCount - 1);
    int lower = int(floor(scaled));
    int upper = int(clamp(float(lower + 1), 0.0, float(uColorCount - 1)));
    float mixAmount = fract(scaled);

    return mix(fetchColor(lower), fetchColor(upper), mixAmount);
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;
    centered.x *= uResolution.x / uResolution.y;

    float time = uTime * 0.25;

    vec2 drift = vec2(
      fbm(centered * 1.4 + time * 0.8),
      fbm(centered * 1.4 - time * 0.6)
    );
    vec2 warpedUv = uv + drift * 0.1;

    float base = fbm(warpedUv * 4.0 + time * 1.2);
    float layer = fbm((warpedUv + drift * 0.5) * 2.0 - time * 0.7);
    float mixNoise = mix(base, layer, 0.35);

    float pointerRadius = max(uCursorSize, 16.0);
    vec2 pointerVec = uv - uPointer;
    pointerVec.x *= uResolution.x / uResolution.y;
    float pointerDist = length(pointerVec);
    float pointerMask = exp(-pow(pointerDist * 400.0 / pointerRadius, 2.0)) * uPointerStrength;

    float gradient = clamp(mixNoise * 0.65 + uv.y * 0.55 + time * 0.12 + pointerMask * 0.35, 0.0, 1.0);

    vec3 baseColor = sampleGradient(gradient);
    vec3 highlight = sampleGradient(clamp(gradient + 0.12 + pointerMask * 0.25, 0.0, 1.0));
    vec3 color = mix(baseColor, highlight, 0.35 + pointerMask * 0.65);

    float shimmer = fbm(warpedUv * 6.0 - time * 1.5 + pointerMask * 0.8);
    color += shimmer * 0.05 * uIntensity;
    color += pointerMask * 0.35 * uIntensity;

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampResolution(value: number | undefined) {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return 0.5;
  }
  return Math.min(0.6, Math.max(0.3, value!));
}

function normalizeColorList(colors?: string[]) {
  if (!colors || colors.length === 0) {
    return [...DEFAULT_COLORS];
  }

  const trimmed = colors
    .map((color) => color.trim())
    .filter((color) => color.length > 0);

  if (trimmed.length === 0) {
    return [...DEFAULT_COLORS];
  }

  return trimmed.slice(0, MAX_COLORS);
}

function isWebGLAvailable() {
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

const LiquidEther = ({
  colors,
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6,
  className,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (!isWebGLAvailable()) return undefined;

    const resolvedResolution = clampResolution(resolution);
    const selectedColors = normalizeColorList(colors);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const pixelRatio = THREE.MathUtils.clamp(devicePixelRatio * resolvedResolution, 0.5, 2);
    renderer.setPixelRatio(pixelRatio);

    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    renderer.setSize(size.x, size.y, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const colorArray = new Float32Array(MAX_COLORS * 3);
    let colorCount = 0;
    for (let index = 0; index < MAX_COLORS; index += 1) {
      const hex = selectedColors[index];
      if (!hex) break;
      const color = new THREE.Color(hex);
      color.convertSRGBToLinear();
      colorArray[index * 3 + 0] = color.r;
      colorArray[index * 3 + 1] = color.g;
      colorArray[index * 3 + 2] = color.b;
      colorCount += 1;
    }

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: size.clone() },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerStrength: { value: 0 },
      uCursorSize: { value: cursorSize },
      uIntensity: { value: autoIntensity },
      uColors: { value: colorArray },
      uColorCount: { value: Math.max(1, colorCount) },
    } satisfies Record<string, THREE.IUniform>;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const manualPointer = new THREE.Vector2(0.5, 0.5);
    const autoPointer = new THREE.Vector2(0.5, 0.5);
    const blendedPointer = new THREE.Vector2(0.5, 0.5);

    let manualStrengthTarget = 0;
    let manualStrength = 0;
    let autoStrength = autoDemo ? 0.4 : 0;
    let pointerBlend = 0;
    let autoPhase = Math.random() * Math.PI * 2;
    let lastInteraction = performance.now();
    let autoActive = autoDemo;
    let autoRamp = autoDemo ? 0 : 1;
    const bounceVelocity = new THREE.Vector2(
      Math.random() * 0.3 - 0.15,
      Math.random() * 0.24 - 0.12
    );

    const viscosityFactor = isViscous ? Math.max(4, viscous) : 18;
    const viscousIterations = Math.max(1, iterationsViscous);
    const poissonIterations = Math.max(1, iterationsPoisson);
    const manualDecay = THREE.MathUtils.clamp(viscosityFactor / viscousIterations / 12, 0.6, 2.4);
    const autoDecay = THREE.MathUtils.clamp(poissonIterations / 32, 0.4, 1.2);
    const followSpeed = 1 / Math.max(0.05, takeoverDuration);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      size.set(width, height);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width, height);
    };

    resize();

    const updateManualPointer = (clientX: number, clientY: number) => {
      const x = clamp01(clientX / size.x);
      const y = clamp01(1 - clientY / size.y);
      manualPointer.set(x, y);
      manualStrengthTarget = Math.max(
        manualStrengthTarget,
        THREE.MathUtils.clamp(mouseForce / 30, 0.1, 3)
      );
      pointerBlend = 1;
      lastInteraction = performance.now();
      autoActive = false;
      autoRamp = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      updateManualPointer(event.clientX, event.clientY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      updateManualPointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updateManualPointer(touch.clientX, touch.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', resize);

    let animationId = 0;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (autoDemo) {
        if (!autoActive && now - lastInteraction > autoResumeDelay) {
          autoActive = true;
        }

        const rampSpeed = delta / Math.max(0.05, autoRampDuration);
        autoRamp = THREE.MathUtils.clamp(autoRamp + (autoActive ? rampSpeed : -rampSpeed), 0, 1);

        if (autoActive) {
          if (isBounce) {
            const speedScale = autoSpeed * 0.35 + 0.15;
            autoPointer.x += bounceVelocity.x * speedScale * delta;
            autoPointer.y += bounceVelocity.y * speedScale * delta;

            if (autoPointer.x < 0.1 || autoPointer.x > 0.9) {
              autoPointer.x = clamp01(autoPointer.x);
              bounceVelocity.x *= -1;
            }
            if (autoPointer.y < 0.1 || autoPointer.y > 0.9) {
              autoPointer.y = clamp01(autoPointer.y);
              bounceVelocity.y *= -1;
            }
          } else {
            autoPhase += delta * (0.6 + autoSpeed * 1.8);
            const amplitudeX = 0.18 + autoIntensity * 0.05;
            const amplitudeY = 0.14 + autoIntensity * 0.04;
            autoPointer.x = clamp01(0.5 + Math.sin(autoPhase) * amplitudeX);
            autoPointer.y = clamp01(0.5 + Math.cos(autoPhase * 0.82 + 1.2) * amplitudeY);
          }
        }

        const targetAutoStrength = autoActive
          ? THREE.MathUtils.clamp(autoIntensity * 0.35 * (0.6 + autoRamp), 0.1, 2)
          : 0;
        const autoLerp = 1 - Math.exp(-delta * (2.4 + autoDecay * 2));
        autoStrength += (targetAutoStrength - autoStrength) * autoLerp;
      } else {
        autoStrength += (0 - autoStrength) * (1 - Math.exp(-delta * 2.2));
      }

      manualStrengthTarget *= Math.exp(-delta * manualDecay * 2.2);
      const manualLerp = 1 - Math.exp(-delta * (4 + viscosityFactor * 0.15));
      manualStrength += (manualStrengthTarget - manualStrength) * manualLerp;

      const manualActive = manualStrengthTarget > 0.01;
      const blendTarget = manualActive ? 1 : 0;
      const blendLerp = 1 - Math.exp(-delta * (followSpeed * 2.2));
      pointerBlend += (blendTarget - pointerBlend) * blendLerp;
      pointerBlend = clamp01(pointerBlend);

      blendedPointer.copy(autoPointer).lerp(manualPointer, pointerBlend);

      const finalStrength = autoStrength * (1 - pointerBlend) + manualStrength * pointerBlend;

      uniforms.uPointer.value.copy(blendedPointer);
      uniforms.uPointerStrength.value = THREE.MathUtils.clamp(finalStrength, 0, 4);
      uniforms.uCursorSize.value = cursorSize;
      uniforms.uIntensity.value = autoIntensity;
      uniforms.uTime.value += delta;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resize);

      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    autoDemo,
    autoIntensity,
    autoRampDuration,
    autoResumeDelay,
    autoSpeed,
    colors,
    cursorSize,
    isBounce,
    isViscous,
    iterationsPoisson,
    iterationsViscous,
    mouseForce,
    resolution,
    takeoverDuration,
    viscous,
  ]);

  return <div ref={containerRef} className={clsx('h-full w-full', className)} />;
};

export default LiquidEther;

