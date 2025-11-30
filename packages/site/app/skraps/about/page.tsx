import { Prose } from '@/registry/new-york/ui/prose/prose';
import Link from 'next/link';

export default function SkrapsPage() {
    return (
        <>
            <Prose>
                <h1>
                    Skraps is a DAW. It's a kitchen-sink demo for tons of
                    important loop-kit stuff.
                </h1>
                <ul>
                    <li>
                        <Link href='/skraps'>Go to Skraps</Link>
                    </li>
                </ul>
            </Prose>
        </>
    );
}
