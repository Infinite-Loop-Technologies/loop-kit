import { ClientOnly } from './client-only';
import FullIDE from '@/registry/toolchain/full-ide';
export default function PlaygroundPage() {
    return (
        <ClientOnly>
            <FullIDE />
        </ClientOnly>
    );
}
