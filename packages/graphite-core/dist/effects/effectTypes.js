export function shouldSkipEffectForOrigin(effect, origin) {
    if (!origin) {
        return false;
    }
    if (effect.guard?.ignoreOwnOrigin && origin === effectOrigin(effect.name)) {
        return true;
    }
    if (effect.guard?.ignoreOrigins?.includes(origin)) {
        return true;
    }
    return false;
}
export function effectOrigin(name) {
    return `effect:${name}`;
}
//# sourceMappingURL=effectTypes.js.map