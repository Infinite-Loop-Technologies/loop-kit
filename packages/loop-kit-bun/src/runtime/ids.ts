export type Namespace = string; // e.g. "loop" or "infinite-loop-technologies"
export type Package = string; // e.g. "core"
export type Version = string; // e.g. "0.1.0"
export type Interface = string; // e.g. "log"

export type CapabilityId = string;
// Canonical string form: `${namespace}:${pkg}@${ver}/${iface}`
// Example: "loop:core@0.1.0/log"

export function capId(
    ns: Namespace,
    pkg: Package,
    ver: Version,
    iface: Interface
): CapabilityId {
    return `${ns}:${pkg}@${ver}/${iface}`;
}
