'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type QueryBuilderFieldType = 'string' | 'number' | 'boolean';

export type QueryBuilderOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'truthy'
  | 'falsy';

export interface QueryBuilderField {
  key: string;
  label: string;
  type: QueryBuilderFieldType;
  operators?: readonly QueryBuilderOperator[];
}

export interface QueryBuilderRule {
  id: string;
  field: string;
  operator: QueryBuilderOperator;
  value: string;
}

export interface QueryBuilderModel {
  mode: 'all' | 'any';
  rules: QueryBuilderRule[];
}

const DEFAULT_OPERATORS: Record<QueryBuilderFieldType, readonly QueryBuilderOperator[]> = {
  string: ['contains', 'eq', 'neq', 'startsWith', 'endsWith', 'truthy', 'falsy'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'truthy', 'falsy'],
  boolean: ['eq', 'neq', 'truthy', 'falsy'],
};

let queryBuilderRuleCounter = 0;

function nextRuleId() {
  queryBuilderRuleCounter += 1;
  return `rule_${Date.now().toString(36)}_${queryBuilderRuleCounter.toString(36)}`;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toComparable(value: unknown) {
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return String(value ?? '').toLowerCase();
}

function getFieldValue(record: Record<string, unknown>, field: string): unknown {
  const steps = field.split('.');
  let current: unknown = record;
  for (const step of steps) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[step];
  }
  return current;
}

function evaluateRule(
  rule: QueryBuilderRule,
  record: Record<string, unknown>
): boolean {
  const actual = getFieldValue(record, rule.field);
  const valueText = rule.value.trim();

  switch (rule.operator) {
    case 'truthy':
      return Boolean(actual);
    case 'falsy':
      return !actual;
    case 'contains': {
      const left = String(actual ?? '').toLowerCase();
      return left.includes(valueText.toLowerCase());
    }
    case 'startsWith': {
      const left = String(actual ?? '').toLowerCase();
      return left.startsWith(valueText.toLowerCase());
    }
    case 'endsWith': {
      const left = String(actual ?? '').toLowerCase();
      return left.endsWith(valueText.toLowerCase());
    }
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const left = parseNumber(actual);
      const right = parseNumber(valueText);
      if (left === null || right === null) return false;
      if (rule.operator === 'gt') return left > right;
      if (rule.operator === 'gte') return left >= right;
      if (rule.operator === 'lt') return left < right;
      return left <= right;
    }
    case 'neq': {
      if (typeof actual === 'boolean') {
        const normalized = valueText.toLowerCase();
        const parsed = normalized === 'true' || normalized === '1';
        return actual !== parsed;
      }
      return toComparable(actual) !== toComparable(valueText);
    }
    case 'eq':
    default: {
      if (typeof actual === 'boolean') {
        const normalized = valueText.toLowerCase();
        const parsed = normalized === 'true' || normalized === '1';
        return actual === parsed;
      }
      return toComparable(actual) === toComparable(valueText);
    }
  }
}

export function createQueryBuilderModel(): QueryBuilderModel {
  return {
    mode: 'all',
    rules: [],
  };
}

export function createQueryBuilderRule(
  field: string,
  operator: QueryBuilderOperator = 'contains',
  value = ''
): QueryBuilderRule {
  return {
    id: nextRuleId(),
    field,
    operator,
    value,
  };
}

export function evaluateQueryBuilder(
  model: QueryBuilderModel,
  record: Record<string, unknown>
): boolean {
  if (model.rules.length === 0) return true;
  if (model.mode === 'any') {
    return model.rules.some((rule) => evaluateRule(rule, record));
  }
  return model.rules.every((rule) => evaluateRule(rule, record));
}

export function summarizeQueryBuilder(model: QueryBuilderModel): string {
  if (model.rules.length === 0) return 'always';
  return `${model.mode === 'all' ? 'all' : 'any'} of ${model.rules.length} rule${model.rules.length === 1 ? '' : 's'}`;
}

function operatorLabel(operator: QueryBuilderOperator): string {
  switch (operator) {
    case 'eq':
      return 'equals';
    case 'neq':
      return 'not equals';
    case 'contains':
      return 'contains';
    case 'startsWith':
      return 'starts with';
    case 'endsWith':
      return 'ends with';
    case 'gt':
      return '>';
    case 'gte':
      return '>=';
    case 'lt':
      return '<';
    case 'lte':
      return '<=';
    case 'truthy':
      return 'is truthy';
    case 'falsy':
      return 'is falsy';
    default:
      return operator;
  }
}

type GraphiteQueryBuilderProps = {
  fields: readonly QueryBuilderField[];
  value: QueryBuilderModel;
  onChange: (next: QueryBuilderModel) => void;
  className?: string;
};

export function GraphiteQueryBuilder({
  fields,
  value,
  onChange,
  className,
}: GraphiteQueryBuilderProps) {
  const fieldMap = useMemo(() => {
    const map = new Map<string, QueryBuilderField>();
    for (const field of fields) {
      map.set(field.key, field);
    }
    return map;
  }, [fields]);

  const fallbackField = fields[0];

  const addRule = () => {
    if (!fallbackField) return;
    const operators = fallbackField.operators ?? DEFAULT_OPERATORS[fallbackField.type];
    const operator = operators[0] ?? 'contains';
    onChange({
      ...value,
      rules: [
        ...value.rules,
        createQueryBuilderRule(fallbackField.key, operator, ''),
      ],
    });
  };

  const updateRule = (ruleId: string, updater: (rule: QueryBuilderRule) => QueryBuilderRule) => {
    onChange({
      ...value,
      rules: value.rules.map((rule) => (rule.id === ruleId ? updater(rule) : rule)),
    });
  };

  const removeRule = (ruleId: string) => {
    onChange({
      ...value,
      rules: value.rules.filter((rule) => rule.id !== ruleId),
    });
  };

  return (
    <section className={className}>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <Label htmlFor='qb-mode'>Match</Label>
        <select
          id='qb-mode'
          value={value.mode}
          onChange={(event) =>
            onChange({
              ...value,
              mode: event.target.value === 'any' ? 'any' : 'all',
            })
          }
          className='h-9 rounded-md border border-input bg-background px-3 text-sm'
        >
          <option value='all'>All rules</option>
          <option value='any'>Any rule</option>
        </select>
        <Button type='button' variant='outline' size='sm' onClick={addRule}>
          Add rule
        </Button>
      </div>

      {value.rules.length === 0 ? (
        <div className='rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground'>
          No rules configured.
        </div>
      ) : (
        <div className='space-y-2'>
          {value.rules.map((rule) => {
            const field = fieldMap.get(rule.field) ?? fallbackField;
            if (!field) return null;
            const operators = field.operators ?? DEFAULT_OPERATORS[field.type];
            const hidesValue =
              rule.operator === 'truthy' || rule.operator === 'falsy';

            return (
              <div
                key={rule.id}
                className='grid gap-2 rounded-lg border bg-card/40 p-2 md:grid-cols-[minmax(150px,1fr)_160px_minmax(180px,1fr)_auto]'
              >
                <select
                  value={rule.field}
                  onChange={(event) => {
                    const nextField =
                      fieldMap.get(event.target.value) ?? fallbackField;
                    if (!nextField) return;
                    const nextOperators =
                      nextField.operators ?? DEFAULT_OPERATORS[nextField.type];
                    const nextOperator = nextOperators[0] ?? 'contains';
                    updateRule(rule.id, (current) => ({
                      ...current,
                      field: nextField.key,
                      operator: nextOperator,
                    }));
                  }}
                  className='h-9 rounded-md border border-input bg-background px-3 text-sm'
                >
                  {fields.map((entry) => (
                    <option key={entry.key} value={entry.key}>
                      {entry.label}
                    </option>
                  ))}
                </select>

                <select
                  value={rule.operator}
                  onChange={(event) =>
                    updateRule(rule.id, (current) => ({
                      ...current,
                      operator: event.target.value as QueryBuilderOperator,
                    }))
                  }
                  className='h-9 rounded-md border border-input bg-background px-3 text-sm'
                >
                  {operators.map((operator) => (
                    <option key={operator} value={operator}>
                      {operatorLabel(operator)}
                    </option>
                  ))}
                </select>

                <Input
                  value={rule.value}
                  onChange={(event) =>
                    updateRule(rule.id, (current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  disabled={hidesValue}
                  placeholder={hidesValue ? 'No value needed' : 'Value'}
                />

                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeRule(rule.id)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
