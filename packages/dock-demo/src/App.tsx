import { useEffect, useMemo, useRef, useState } from 'react';
import { createGraphStore, type GraphState } from '@loop-kit/graphite';
import {
  createDockDebugRenderer,
  createDockIntentNames,
  createDockPanelQuery,
  createDockState,
  createGroupNode,
  createPanelNode,
  createSplitNode,
  registerDockIntents,
  type DockState,
} from '@loop-kit/dock';

interface DemoState extends GraphState {
  dock: DockState;
}

function createDemoDockState(): DockState {
  const panelExplorer = createPanelNode('panel-explorer', 'Explorer');
  const panelEditor = createPanelNode('panel-editor', 'Editor');
  const panelPreview = createPanelNode('panel-preview', 'Preview');
  const panelConsole = createPanelNode('panel-console', 'Console');

  const groupLeft = createGroupNode('group-left', [panelExplorer.id], panelExplorer.id);
  const groupMain = createGroupNode('group-main', [panelEditor.id, panelPreview.id], panelEditor.id);
  const groupBottom = createGroupNode('group-bottom', [panelConsole.id], panelConsole.id);

  const splitVertical = createSplitNode('split-vertical', 'col', [groupMain.id, groupBottom.id], [0.72, 0.28]);
  const splitRoot = createSplitNode('split-root', 'row', [groupLeft.id, splitVertical.id], [0.26, 0.74]);

  return createDockState({
    rootId: splitRoot.id,
    floatRootId: 'float-root-main',
    nodes: {
      [panelExplorer.id]: panelExplorer,
      [panelEditor.id]: panelEditor,
      [panelPreview.id]: panelPreview,
      [panelConsole.id]: panelConsole,
      [groupLeft.id]: groupLeft,
      [groupMain.id]: groupMain,
      [groupBottom.id]: groupBottom,
      [splitVertical.id]: splitVertical,
      [splitRoot.id]: splitRoot,
    },
  });
}

export function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const intents = useMemo(() => createDockIntentNames('dock'), []);

  const store = useMemo(() => {
    const graphite = createGraphStore<DemoState>({
      initialState: {
        dock: createDemoDockState(),
      },
      eventMode: 'when-observed',
      maxCommits: 2000,
    });

    registerDockIntents(graphite, {
      path: ['dock'],
      intentPrefix: 'dock',
    });

    return graphite;
  }, []);

  const [commitCount, setCommitCount] = useState(store.getCommitLog().length);
  const [panels, setPanels] = useState(() => store.query(createDockPanelQuery<DemoState>({ path: ['dock'] })));
  const [historyState, setHistoryState] = useState(() => ({
    canUndo: store.canUndo('dock'),
    canRedo: store.canRedo('dock'),
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const renderer = createDockDebugRenderer<DemoState>({
      store,
      mount: mountRef.current,
      dockPath: ['dock'],
      intentPrefix: 'dock',
      historyChannel: 'dock',
      layoutOptions: {
        tabBarHeight: 28,
        splitterSize: 8,
      },
      hitTestOptions: {
        edgePx: 28,
        hysteresisPx: 10,
      },
    });

    return () => renderer.dispose();
  }, [store]);

  useEffect(() => {
    return store.onCommit(() => {
      setCommitCount(store.getCommitLog().length);
      setPanels(store.query(createDockPanelQuery<DemoState>({ path: ['dock'] })));
      setHistoryState({
        canUndo: store.canUndo('dock'),
        canRedo: store.canRedo('dock'),
      });
    });
  }, [store]);

  const addPanel = () => {
    store.dispatchIntent(
      intents.addPanel,
      {
        title: `Panel ${panels.length + 1}`,
      },
      {
        metadata: {
          domain: 'dock',
          source: 'dock-demo.toolbar.add-panel',
        },
        history: 'dock',
      }
    );
  };

  return (
    <main className='app-shell'>
      <header className='toolbar'>
        <h1>dock</h1>
        <div className='toolbar-actions'>
          <button onClick={addPanel}>Add Panel</button>
          <button onClick={() => store.undo(undefined, 'dock')} disabled={!historyState.canUndo}>
            Undo
          </button>
          <button onClick={() => store.redo(undefined, 'dock')} disabled={!historyState.canRedo}>
            Redo
          </button>
        </div>
        <div className='toolbar-meta'>
          <span>Commits: {commitCount}</span>
          <span>Panels: {panels.length}</span>
        </div>
      </header>

      <section className='stage'>
        <div className='dock-surface' ref={mountRef} />
        <aside className='side-panel'>
          <h2>Panels</h2>
          <ul>
            {panels.map((panel) => (
              <li key={panel.id}>
                <strong>{panel.title}</strong>
                <span>{panel.groupId ?? 'unassigned'}</span>
              </li>
            ))}
          </ul>
          <p>
            Drag tabs to re-dock. Drag split bars to resize. Resize commits are transient during drag and committed to history on release.
          </p>
        </aside>
      </section>
    </main>
  );
}
