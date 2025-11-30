import { LC, Yeet } from '@use-gpu/live';
import * as z from 'zod';

/* ---------- ATOM CREATORS ---------- */
function textAtom() {
    // Unique via construction
    const sym = Symbol();
    throw new Error('Not Implemented');
}

/* ---------- END ATOM CREATORS ---------- */

// defining my atom that represents the name of the doc page (just one in whole app for now)
// atoms can go in block/component files, just outside of local component state
// - and typically atoms will mean atom creators, not the atoms themselves - problematic terminology!!!
const panelEngineDocsPage = textAtom('hi hi hi');

// CONCEPT: atoms are somehow related to Live components or effects?
// would make sense for heavily stateful atoms, maybe? constantly ingesting complex data and updating.
// this is fine but we need to make it intent based
// so atoms would internally hold state in hooks, and use live components to orchestrate dataflow and maybe even side effects. that's fine, actually. key point though - individual live comps are the atoms, and atoms can be composed of many atoms. also key point - atoms are effects, e.g. atoms ARE atom creators, atom instances are still atom creators. confused - no, this is like thinking that () => React.FC is the same as React.FC - I mean it can be, but not quite. EH.. it is the same, come on.

/**
 * # ATOMS
 * atoms/atom creators are the same as components - functions of immutable props & internal mutable state.
 * The main difference is that they're meant to return some kind of interface to be used from other worlds, e.g. regular react comps, or even outside react.
 * I guess kinda like context providers in a way - honestly the only difference is that we're using headless Live components that can flow data 2-ways, which are perfect for this use case - they're great for making complex incremental durable pipelines and stuff - but we will need some more scaffolding than just Live components - we need to combine it with schema and a structured way of using these from React - or just from a hook in React (actually a perfectly fine, maybe even great design pattern)
 * Thinking about it like using a React component within a hook in another React component - this will drive react devs insane unless I frame it as like a jotai type of thing. Idk I just gotta see if this will work at this point.
 */
const FancyIncrementalAtom: LC = () => {
    // It's an LC, but it's an atom - that means the main thing is props. Concept - atoms use schema
    // basically all of them are gonna return yeet - although write-only atoms are totally fine just like jotai
    return <Yeet>{'hi'}</Yeet>;
};

// ACTUALLY we can't just treat these as cute little things you wire to hooks when they're in reality super powerful ways of structuring dataflow.
// wait - no we can totally do that, we just need a better interface than <Gather> - so use a component that gathers internally and gives you that in the result, letting you pass it to react comps. like useAtom - useAtom wants you to pass in inputs and it returns reactive current values, it's just a hook.
// Could be a comp too, why not? <Atom> or something
