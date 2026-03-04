import { useEffect, useState } from 'react';
import { useScope } from './useScope.js';

export function useStateSlice<TSlice>(facetName: string): TSlice | undefined {
    const { scope } = useScope();

    const readSlice = (): TSlice | undefined =>
        scope.getStateView().getSlice<TSlice>(facetName);

    const [slice, setSlice] = useState<TSlice | undefined>(readSlice);

    useEffect(() => {
        const unsubscribe = scope.subscribeStateView(() => {
            setSlice(readSlice());
        });

        setSlice(readSlice());
        return unsubscribe;
    }, [scope, facetName]);

    return slice;
}
