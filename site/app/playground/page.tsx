import { ClientOnly } from './client-only';
import Page from '@/registry/new-york/blocks/dockview/components/panels';

export default function PlaygroundPage() {
    return (
        <ClientOnly>
            <Page />
        </ClientOnly>
    );
}
