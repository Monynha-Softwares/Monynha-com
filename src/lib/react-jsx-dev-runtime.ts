import { Fragment, jsx as baseJsx, jsxs as baseJsxs } from 'react/jsx-runtime';

type BaseJsx = typeof baseJsx;

export function jsxDEV(
  type: Parameters<BaseJsx>[0],
  config: Parameters<BaseJsx>[1],
  maybeKey?: Parameters<BaseJsx>[2],
  _source?: unknown,
  _self?: unknown
): ReturnType<BaseJsx> {
  return baseJsx(type, config, maybeKey);
}

export { Fragment };
export const jsx = baseJsx;
export const jsxs = baseJsxs;
