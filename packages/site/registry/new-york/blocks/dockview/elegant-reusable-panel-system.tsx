// Tanstack collections used automatically, or you can provide your own.
// These are like God - it's where all state is.
// Queries can be done easily with useLiveQuery, or just create a custom hook like useActivePanel or something.

// THIS AREA IS UTILITIES
// useCollection -> Uses the override if provided. Otherwise falls back to some kind of default collection.

// Example:
const uiStateCollection = createCollection(
    localOnlyCollectionOptions({
        id: 'ui-state',
        getKey: (item) => item.id,
    })
);

import { createTransaction } from '@tanstack/react-db';

const localData = createCollection(
    localOnlyCollectionOptions({
        id: 'form-draft',
        getKey: (item) => item.id,
    })
);

const serverCollection = createCollection(
    queryCollectionOptions({
        queryKey: ['items'],
        queryFn: async () => api.items.getAll(),
        getKey: (item) => item.id,
        onInsert: async ({ transaction }) => {
            await api.items.create(transaction.mutations[0].modified);
        },
    })
);

const tx = createTransaction({
    mutationFn: async ({ transaction }) => {
        // Handle server collection mutations explicitly in mutationFn
        await Promise.all(
            transaction.mutations
                .filter((m) => m.collection === serverCollection)
                .map((m) => api.items.create(m.modified))
        );

        // After server mutations succeed, accept local collection mutations
        localData.utils.acceptMutations(transaction);
    },
});

// Apply mutations to both collections in one transaction
tx.mutate(() => {
    localData.insert({ id: 'draft-1', data: '...' });
    serverCollection.insert({ id: '1', name: 'Item' });
});

await tx.commit();
