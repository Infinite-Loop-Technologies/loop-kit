import { ForgeRoot } from './components/forge-root';
import { ForgeRouterProvider } from './lib/forge-router';
import { ForgeSessionProvider } from './lib/forge-session';

export function App() {
    return (
        <ForgeRouterProvider>
            <ForgeSessionProvider>
                <ForgeRoot />
            </ForgeSessionProvider>
        </ForgeRouterProvider>
    );
}
