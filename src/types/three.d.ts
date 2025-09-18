declare module 'three' {
  export const SRGBColorSpace: unknown;
  export const ACESFilmicToneMapping: unknown;

  export namespace MathUtils {
    function clamp(value: number, min: number, max: number): number;
  }

  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    clone(): Vector2;
    set(x: number, y: number): this;
    setScalar(value: number): this;
    copy(vector: Vector2): this;
    lerp(v: Vector2, alpha: number): this;
  }

  export class Color {
    constructor(color?: string | number);
    r: number;
    g: number;
    b: number;
    convertSRGBToLinear(): this;
  }

  export interface IUniform<T = unknown> {
    value: T;
  }

  export interface ShaderMaterialParameters {
    uniforms?: Record<string, IUniform>;
    vertexShader?: string;
    fragmentShader?: string;
    transparent?: boolean;
  }

  export class ShaderMaterial {
    uniforms: Record<string, IUniform>;
    constructor(parameters?: ShaderMaterialParameters);
    dispose(): void;
  }

  export interface WebGLRendererParameters {
    alpha?: boolean;
    antialias?: boolean;
    powerPreference?: 'default' | 'high-performance' | 'low-power';
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    outputColorSpace: unknown;
    toneMapping: unknown;
    constructor(parameters?: WebGLRendererParameters);
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  export class Scene {
    add(...objects: Object3D[]): void;
    remove(...objects: Object3D[]): void;
  }

  export class Object3D {}

  export class Camera extends Object3D {}

  export class OrthographicCamera extends Camera {
    constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number);
  }

  export class BufferGeometry {
    dispose(): void;
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width: number, height: number);
  }

  export class Mesh<TGeometry extends BufferGeometry = BufferGeometry, TMaterial = ShaderMaterial> extends Object3D {
    constructor(geometry?: TGeometry, material?: TMaterial);
  }
}
