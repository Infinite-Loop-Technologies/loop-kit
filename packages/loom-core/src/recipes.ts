import type { PrimitiveState, ResolvedVariantValues } from './blueprints';
import type { ResolvedStyles } from './styles';
import type { LoomTokens } from './tokens';

/**
 * Recipes are pure style resolvers. They receive inert tokens, resolved
 * variants, and primitive state, then return part-keyed ResolvedStyles.
 */
export type RecipeContext = {
    tokens: LoomTokens;
    variants: ResolvedVariantValues;
    state: PrimitiveState;
};

export type Recipe = (context: RecipeContext) => ResolvedStyles;

export function defineRecipe(recipe: Recipe): Recipe {
    return recipe;
}
