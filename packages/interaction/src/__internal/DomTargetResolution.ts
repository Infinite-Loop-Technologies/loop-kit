/**
 * DOM target resolution helpers.
 *
 * The registry uses these helpers to climb from an event target to registered
 * elements without requiring browser globals in tests. It does not synthesize
 * interaction behavior.
 *
 * @module
 */

export const getElementFromEventTarget = (target: EventTarget | null): Element | null => {
  if (!target || typeof target !== "object") return null

  if (isElementLike(target)) return target

  const maybeNode = target as { readonly parentElement?: Element | null }
  return maybeNode.parentElement ?? null
}

export const getParentElement = (element: Element): Element | null => {
  const maybeElement = element as { readonly parentElement?: Element | null }
  return maybeElement.parentElement ?? null
}

const isElementLike = (value: object): value is Element =>
  "parentElement" in value || "tagName" in value || "nodeType" in value
