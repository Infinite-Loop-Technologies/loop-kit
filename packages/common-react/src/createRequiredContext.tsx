/**
 * Small helper for strict React context consumption.
 *
 * This keeps provider code honest: consumers either receive a real value or a
 * precise error explaining which provider is missing.
 */

import { createContext, useContext } from "react";

export const createRequiredContext = <T,>(name: string) => {
  const Context = createContext<T | null>(null);

  const useRequiredContext = (): T => {
    const value = useContext(Context);
    if (value == null) {
      throw new Error(`${name} provider is missing.`);
    }
    return value;
  };

  return [Context, useRequiredContext] as const;
};
