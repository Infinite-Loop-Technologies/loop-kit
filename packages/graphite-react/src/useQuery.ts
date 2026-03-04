import { useEffect, useState } from 'react';
import type { QueryFn } from '@loop-kit/graphite-core';
import { useScope } from './useScope.js';
import type { UseQueryOptions } from './types.js';

export function useQuery<T>(queryFn: QueryFn<T>, options: UseQueryOptions = {}): T {
    const { scope } = useScope();
    const deps = options.deps ?? [];

    const [value, setValue] = useState<T>(() => scope.queryEngine.run(queryFn).value);

    useEffect(() => {
        const subscription = scope.queryEngine.subscribe(queryFn, (nextValue: T) => {
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
