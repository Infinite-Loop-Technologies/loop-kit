import { useEffect } from 'react';
import type { Recognizer } from '@loop-kit/graphite-core';
import { useScope } from './useScope.js';

export function useRecognizer(recognizer: Recognizer): void {
    const { scope } = useScope();

    useEffect(() => scope.interactionRuntime.registerRecognizer(recognizer), [scope, recognizer]);
}
