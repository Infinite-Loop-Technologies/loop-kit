import { ClientOnly } from '../playground/client-only';
import State from './state';

export default function PlaygroundPage() {
    return (
        <ClientOnly>
            <State />
        </ClientOnly>
    );
}
