export class ActionRegistry {
    actions = new Map();
    registerAction(id, definition) {
        this.actions.set(id, definition);
        return () => {
            this.actions.delete(id);
        };
    }
    canRun(id, context, payload) {
        const action = this.actions.get(id);
        if (!action) {
            return false;
        }
        return action.when ? action.when(context, payload) : true;
    }
    dispatch(id, context, payload) {
        const action = this.actions.get(id);
        if (!action) {
            return false;
        }
        if (action.when && !action.when(context, payload)) {
            return false;
        }
        action.run(context, payload);
        return true;
    }
    getAction(id) {
        return this.actions.get(id);
    }
    listActionIds() {
        return Array.from(this.actions.keys());
    }
}
//# sourceMappingURL=actionRegistry.js.map