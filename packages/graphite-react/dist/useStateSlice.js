import { useEffect, useState } from 'react';
import { useScope } from './useScope.js';
export function useStateSlice(facetName) {
    const { scope } = useScope();
    const readSlice = () => scope.getStateView().getSlice(facetName);
    const [slice, setSlice] = useState(readSlice);
    useEffect(() => {
        const unsubscribe = scope.subscribeStateView(() => {
            setSlice(readSlice());
        });
        setSlice(readSlice());
        return unsubscribe;
    }, [scope, facetName]);
    return slice;
}
//# sourceMappingURL=useStateSlice.js.map