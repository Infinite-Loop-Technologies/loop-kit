import { dirname, resolve } from "node:path";
import { parse as parseWithOxc } from "oxc-parser";
import { Project, QuoteKind, VariableDeclarationKind } from "ts-morph";
import type { VoltTaskDefinition } from "./task";
import { task } from "./task";
import { ensureDirectory, writeJsonFile, writeTextFile } from "./utils";

type Brand<TValue, TBrand extends string> = TValue & {
  readonly __voltBrand: TBrand;
};

export interface VoltSchema<TValue = unknown> {
  _type?: TValue;
  brand: <TBrand extends string>(name: TBrand) => VoltSchema<Brand<TValue, TBrand>>;
  description: (text: string) => VoltSchema<TValue>;
  optional: () => VoltSchema<TValue | undefined>;
  toJSON: () => Record<string, unknown>;
}

interface VoltNumberSchema<TValue = number> extends VoltSchema<TValue> {
  int: () => VoltNumberSchema<TValue>;
  min: (value: number) => VoltNumberSchema<TValue>;
}

type InferSchemaValue<TSchema> = TSchema extends VoltSchema<infer TValue> ? TValue : never;

interface VoltFunctionSchema<TInput, TOutput> extends VoltSchema<
  (input: TInput) => Promise<TOutput> | TOutput
> {}

type InterfaceMembers = Record<string, VoltFunctionSchema<any, any>>;

export interface VoltInterfaceContract<TMembers extends InterfaceMembers = InterfaceMembers> {
  kind: "interface";
  members: TMembers;
  name: string;
  toJSON: () => Record<string, unknown>;
}

export interface VoltResourceContract<TMembers extends InterfaceMembers = InterfaceMembers> {
  kind: "resource";
  members: TMembers;
  name: string;
  toJSON: () => Record<string, unknown>;
}

export interface VoltNamedContract<
  TValue extends VoltInterfaceContract | VoltResourceContract = VoltInterfaceContract,
> {
  kind: "contract";
  name: string;
  value: TValue;
  toJSON: () => Record<string, unknown>;
}

const createSchema = <TValue>(
  shape: Record<string, unknown>,
): VoltSchema<TValue> => ({
  brand(name) {
    return createSchema<Brand<TValue, typeof name>>({
      ...shape,
      brand: name,
    });
  },
  description(text) {
    return createSchema<TValue>({
      ...shape,
      description: text,
    });
  },
  optional() {
    return createSchema<TValue | undefined>({
      ...shape,
      optional: true,
    });
  },
  toJSON() {
    return shape;
  },
});

const createNumberSchema = (
  shape: Record<string, unknown>,
): VoltNumberSchema => ({
  ...createSchema<number>(shape),
  int() {
    return createNumberSchema({
      ...shape,
      integer: true,
    });
  },
  min(value) {
    return createNumberSchema({
      ...shape,
      minimum: value,
    });
  },
});

export const t = {
  array<TItem>(item: VoltSchema<TItem>) {
    return createSchema<TItem[]>({
      items: item.toJSON(),
      kind: "array",
    });
  },
  boolean() {
    return createSchema<boolean>({
      kind: "boolean",
    });
  },
  fn<TInputSchema extends VoltSchema, TOutputSchema extends VoltSchema>(definition: {
    input: TInputSchema;
    output: TOutputSchema;
  }): VoltFunctionSchema<InferSchemaValue<TInputSchema>, InferSchemaValue<TOutputSchema>> {
    return createSchema<
      (input: InferSchemaValue<TInputSchema>) =>
        | Promise<InferSchemaValue<TOutputSchema>>
        | InferSchemaValue<TOutputSchema>
    >({
      input: definition.input.toJSON(),
      kind: "function",
      output: definition.output.toJSON(),
    });
  },
  literal<TValue extends string | number | boolean>(value: TValue) {
    return createSchema<TValue>({
      kind: "literal",
      value,
    });
  },
  number() {
    return createNumberSchema({
      kind: "number",
    });
  },
  object<TShape extends Record<string, VoltSchema>>(shape: TShape) {
    return createSchema<{ [TKey in keyof TShape]: InferSchemaValue<TShape[TKey]> }>({
      kind: "object",
      properties: Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [key, value.toJSON()]),
      ),
    });
  },
  string() {
    return createSchema<string>({
      kind: "string",
    });
  },
};

export const defineInterface = <const TMembers extends InterfaceMembers>(
  name: string,
  members: TMembers,
): VoltInterfaceContract<TMembers> => ({
  kind: "interface",
  members,
  name,
  toJSON: () => ({
    kind: "interface",
    members: Object.fromEntries(
      Object.entries(members).map(([key, value]) => [key, value.toJSON()]),
    ),
    name,
  }),
});

export const defineResource = <const TMembers extends InterfaceMembers>(
  name: string,
  members: TMembers,
): VoltResourceContract<TMembers> => ({
  kind: "resource",
  members,
  name,
  toJSON: () => ({
    kind: "resource",
    members: Object.fromEntries(
      Object.entries(members).map(([key, value]) => [key, value.toJSON()]),
    ),
    name,
  }),
});

export const defineContract = <
  TValue extends VoltInterfaceContract | VoltResourceContract,
>(
  name: string,
  value: TValue,
): VoltNamedContract<TValue> => ({
  kind: "contract",
  name,
  toJSON: () => ({
    kind: "contract",
    name,
    value: value.toJSON(),
  }),
  value,
});

export const contractBindingsTask = (definition: {
  contracts: Array<
    | VoltInterfaceContract
    | VoltNamedContract
    | VoltResourceContract
  >;
  jsonPath?: string;
  tsPath: string;
}): VoltTaskDefinition<unknown, { jsonPath?: string; tsPath: string }> =>
  task({
    async run(context) {
      const rootDir = context.rootDir;
      const entries = definition.contracts.map((contract) => contract.toJSON());
      const tsPath = resolve(rootDir, definition.tsPath);
      const jsonPath = definition.jsonPath
        ? resolve(rootDir, definition.jsonPath)
        : undefined;

      await ensureDirectory(dirname(tsPath));
      const project = new Project({
        manipulationSettings: {
          quoteKind: QuoteKind.Single,
        },
        useInMemoryFileSystem: true,
      });
      const sourceFile = project.createSourceFile(tsPath, "", { overwrite: true });
      sourceFile.addStatements("// Generated by Volt contractBindingsTask.");
      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            initializer: `${JSON.stringify(entries, null, 2)} as const`,
            name: "contractBindings",
          },
        ],
        isExported: true,
      });

      const generated = sourceFile.getFullText();
      const parsed = await parseWithOxc(tsPath, generated, {
        lang: "ts",
        sourceType: "module",
      });
      if (parsed.errors.length > 0) {
        throw new Error(
          `Generated contract bindings are not valid TypeScript: ${parsed.errors
            .map((error) => error.message)
            .join("; ")}`,
        );
      }

      await writeTextFile(tsPath, generated);

      if (jsonPath) {
        await writeJsonFile(jsonPath, {
          contracts: entries,
          generatedAt: new Date().toISOString(),
          note: "This manifest is TypeScript-first metadata inferred from Volt contract definitions. It is not WIT output.",
        });
      }

      return { jsonPath, tsPath };
    },
  });
