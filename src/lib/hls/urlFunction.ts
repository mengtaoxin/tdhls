export const URL_FUNCTION_KEY = 'tdhls.urlFunction';

export const DEFAULT_URL_FUNCTION = `function transform(url) {
  return url;
}`;

/**
 * Evaluates the saved source as a function expression.
 * Returns null when the source cannot be parsed or is not a function.
 */
export function compileUrlFunction(source: string): ((url: string) => unknown) | null {
  try {
    const fn = new Function(`return (${source});`)();
    return typeof fn === 'function' ? fn : null;
  } catch {
    return null;
  }
}

/** Returns the compiler error message when the source is not a usable function, otherwise null. */
export function getUrlFunctionCompileError(source: string): string | null {
  try {
    const fn = new Function(`return (${source});`)();
    if (typeof fn !== 'function') return 'Value is not a function';
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/**
 * Runs the configured function against the url. Any syntax error, thrown
 * exception, or non-string result falls back to the original url.
 */
export function applyUrlFunction(source: string, url: string): string {
  const fn = compileUrlFunction(source);
  if (!fn) return url;
  try {
    const result = fn(url);
    return typeof result === 'string' ? result : url;
  } catch {
    return url;
  }
}
