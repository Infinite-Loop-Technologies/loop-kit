import { useMemo } from 'react';
import {
    $each,
    $limit,
    $orderBy,
    composeQuery,
    defineQueryMacro,
} from '@loop-kit/graphite';
import type { QueryInput } from '@loop-kit/graphite';
import type {
    GraphiteDemoState,
    TaskRecord,
} from '../intentproducers/task-intents';
import {
    createQueryBuilderModel,
    evaluateQueryBuilder,
    type QueryBuilderModel,
} from '../systems/graphite-query-builder';

export interface TaskQueryModel {
    textFilter: string;
    minPriority: number;
    includeCompleted: boolean;
    sortDirection: 'asc' | 'desc';
    rules: QueryBuilderModel;
}

const $containsText = defineQueryMacro(
    'containsText',
    (value: string) => value,
);

function toTaskFilterRecord(task: TaskRecord): Record<string, unknown> {
    return {
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority,
        tags: task.tags.join(' '),
        createdAt: task.createdAt,
    };
}

export function buildTaskQuery(
    model: TaskQueryModel,
): QueryInput<GraphiteDemoState, { tasks: TaskRecord[] }> {
    const predicate = (task: TaskRecord) =>
        (model.includeCompleted || !task.completed) &&
        task.priority >= model.minPriority &&
        evaluateQueryBuilder(model.rules, toTaskFilterRecord(task));

    return {
        tasks: {
            ...composeQuery(
                $containsText(model.textFilter.trim()),
                $orderBy({ key: 'priority', direction: model.sortDirection }),
                $limit(200),
            ),
            $where: predicate,
            tags: { ...$each(true) },
        },
    };
}

export function useGraphiteTaskQuery(
    model: TaskQueryModel,
): QueryInput<GraphiteDemoState, { tasks: TaskRecord[] }> {
    return useMemo(
        () => buildTaskQuery(model),
        [
            model.textFilter,
            model.minPriority,
            model.includeCompleted,
            model.sortDirection,
            model.rules,
        ],
    );
}

export function createDefaultTaskQueryModel(): TaskQueryModel {
    return {
        textFilter: '',
        minPriority: 0,
        includeCompleted: false,
        sortDirection: 'desc',
        rules: createQueryBuilderModel(),
    };
}
