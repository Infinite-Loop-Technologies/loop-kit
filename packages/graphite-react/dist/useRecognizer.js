import { useEffect } from 'react';
import { useScope } from './useScope.js';
export function useRecognizer(recognizer) {
    const { scope } = useScope();
    useEffect(() => scope.interactionRuntime.registerRecognizer(recognizer), [scope, recognizer]);
}
//# sourceMappingURL=useRecognizer.js.map