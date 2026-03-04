import { useEffect, useState } from 'react';
import { useScope } from './useScope.js';
export function useQuery(queryFn, options = {}) {
    const { scope } = useScope();
    const deps = options.deps ?? [];
    const [value, setValue] = useState(() => scope.queryEngine.run(queryFn).value);
    useEffect(() => {
        const subscription = scope.queryEngine.subscribe(queryFn, (nextValue) => {
            setValue(nextValue);
        });
        setValue(subscription.getCurrent());
        return () => {
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scope, queryFn, ...deps]);
    return value;
}
//# sourceMappingURL=useQuery.js.map