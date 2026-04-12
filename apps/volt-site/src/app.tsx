const pillars = [
  {
    body: "One config can coordinate a browser app, a Bun API, a websocket process, and the small supporting tasks around them.",
    title: "Multi-target by default",
  },
  {
    body: "Targets are explicit, Bun-native, and composable instead of hiding orchestration behind a giant opaque runtime.",
    title: "Small core, sharp edges",
  },
  {
    body: "The same monorepo ships the framework package, a `create-volt` scaffolder, a runtime demo app, and this site.",
    title: "Monorepo that proves itself",
  },
];

const roadmap = [
  "Publishable `volt` and `create-volt` packages.",
  "Task-runner style command targets for dev process orchestration.",
  "Template spawning with bundled templates and remote manifest support.",
  "A cleaner lifecycle plugin API inspired by Bun's bundler hooks.",
];

export function App() {
  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Volt</p>
          <h1>Bun’s small-but-serious metaframework.</h1>
          <p className="lede">
            Volt is a Bun-native host/metaframework for contract-bound
            artifacts and services. Make external capabilities feel local,
            typed, and composable across environments.
          </p>
          <div className="hero-actions">
            <a href="/api/roadmap" className="primary-link">See live roadmap JSON</a>
            <code className="command">bun create volt my-app</code>
          </div>
        </div>

        <div className="hero-panel">
          <p className="panel-label">Example</p>
          <pre>
{`export default defineVoltConfig({
  targets: {
    web: bun.fullstack({ ... }),
    game: bun.server({ dependsOn: ["web"] }),
    docs: bun.command({ commands: { dev: ["bun", "run", "docs:dev"] } }),
  },
});`}
          </pre>
        </div>
      </section>

      <section className="pillars">
        {pillars.map((pillar) => (
          <article className="pillar-card" key={pillar.title}>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="roadmap">
        <div>
          <p className="eyebrow">Roadmap</p>
          <h2>What this repo now ships</h2>
        </div>
        <ul>
          {roadmap.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </main>
  );
}
