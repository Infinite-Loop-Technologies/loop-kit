const DEFAULT_RULES = [
    { regionType: 'drop-center', score: 100 },
    { regionType: 'drop-left', score: 80 },
    { regionType: 'drop-right', score: 80 },
    { regionType: 'drop-top', score: 80 },
    { regionType: 'drop-bottom', score: 80 },
    { regionType: 'tab', score: 70 },
];
export function scoreDockDropTarget(hit, rules = DEFAULT_RULES) {
    if (!hit) {
        return Number.NEGATIVE_INFINITY;
    }
    const matched = rules.find((rule) => rule.regionType === hit.regionType);
    return matched ? matched.score : Number.NEGATIVE_INFINITY;
}
//# sourceMappingURL=policy.js.map