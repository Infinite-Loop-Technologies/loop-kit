import { useMemo } from 'react';
import type { GraphiteIntentRegistryEntry } from './graphite-intent-registry';
import {
  createShortcutBinding,
  useGraphiteShortcutBindings,
  type GraphiteShortcutBinding,
} from './graphite-shortcut-manager';
import type { QueryBuilderField } from './graphite-query-builder';
import type { GraphiteDemoState } from '../intentproducers/task-intents';

export const TASK_SHORTCUT_CONTEXT_FIELDS: QueryBuilderField[] = [
  {
    key: 'hasSelection',
    label: 'Has Selection',
    type: 'boolean',
  },
  {
    key: 'hasFallback',
    label: 'Has Fallback',
    type: 'boolean',
  },
  {
    key: 'taskCount',
    label: 'Task Count',
    type: 'number',
  },
  {
    key: 'completedCount',
    label: 'Completed Count',
    type: 'number',
  },
  {
    key: 'filter',
    label: 'Filter Text',
    type: 'string',
  },
];

export function createTaskIntentRegistry(
  selectedTaskId: string | null,
  fallbackTargetId: string | null
): GraphiteIntentRegistryEntry<GraphiteDemoState>[] {
  return [
    {
      id: 'task.add',
      intent: 'task/add',
      title: 'Add Inbox Task',
      description: 'Create a new task with starter tags.',
      category: 'Tasks',
      keywords: ['create', 'new'],
      payload: () => ({
        title: 'Inbox task from shortcut',
        priority: 1,
        tags: ['shortcut'],
      }),
    },
    {
      id: 'task.toggle',
      intent: 'task/toggle',
      title: 'Toggle Selected Task',
      description: 'Toggle completion state for the active task.',
      category: 'Tasks',
      payload: () => ({
        id: selectedTaskId ?? undefined,
      }),
    },
    {
      id: 'task.link',
      intent: 'task/link',
      title: 'Link Selected to Fallback',
      description: 'Create a relation from selected task to fallback task.',
      category: 'Tasks',
      payload: () => ({
        from: selectedTaskId ?? undefined,
        to: fallbackTargetId ?? undefined,
        relation: 'shortcut-linked',
      }),
    },
    {
      id: 'task.delete',
      intent: 'task/delete',
      title: 'Delete Selected Task',
      description: 'Delete the currently selected task.',
      category: 'Tasks',
      payload: () => ({
        id: selectedTaskId ?? undefined,
      }),
    },
    {
      id: 'task.remove-completed',
      intent: 'task/remove-completed',
      title: 'Remove Completed Tasks',
      description: 'Delete all completed tasks.',
      category: 'Tasks',
    },
    {
      id: 'post.import',
      intent: 'post/import',
      title: 'Import Posts',
      description: 'Import posts from connector payload.',
      category: 'Posts',
      payload: () => ({
        posts: [],
      }),
    },
  ];
}

export function createDefaultTaskShortcutBindings() {
  const bindings: GraphiteShortcutBinding[] = [
    createShortcutBinding('task.add', 'alt+shift+n'),
    createShortcutBinding('task.toggle', 'alt+shift+t'),
    createShortcutBinding('task.link', 'alt+shift+l'),
    createShortcutBinding('task.delete', 'alt+shift+backspace'),
    createShortcutBinding('task.remove-completed', 'alt+shift+u'),
  ];

  return bindings.map((binding) => ({
    ...binding,
    preventDefault: true,
    enabled: true,
  }));
}

export function useGraphiteShortcutSystem(
  intents: readonly GraphiteIntentRegistryEntry<GraphiteDemoState>[],
  bindings: readonly GraphiteShortcutBinding[],
  enabled: boolean
) {
  const contextSelector = useMemo(
    () => (state: Readonly<GraphiteDemoState>) => {
      const selectedTaskId = state.ui.selectedTaskId ?? '';
      const completedCount = state.tasks.filter((task) => task.completed).length;
      const hasSelection = selectedTaskId.length > 0;
      const hasFallback = state.tasks.some((task) => task.id !== selectedTaskId);
      return {
        hasSelection,
        hasFallback,
        taskCount: state.tasks.length,
        completedCount,
        filter: state.ui.filter,
      };
    },
    []
  );

  return useGraphiteShortcutBindings<GraphiteDemoState>({
    intents,
    bindings,
    contextSelector,
    enabled,
  });
}
