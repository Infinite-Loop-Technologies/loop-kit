# Moon + Proto Workflow

`loop-kit` uses Proto to provision pinned developer tools and Moon to orchestrate workspace tasks.

## Source of truth

- `.prototools` pins repository-scoped binary tools such as `moon`, `node`, `pnpm`, `rust`, `go`, and `dotenvx`.
- `.moon/toolchains.yml` configures Moon's toolchain behavior and pins the Proto version Moon should expect in CI.
- `.github/workflows/ci.yml` uses `moonrepo/setup-toolchain@v0` so CI restores the Proto cache and installs the pinned toolchain automatically.

## Local setup

Install Proto first:

```powershell
irm https://moonrepo.dev/install/proto.ps1 | iex
```

If Proto is installed but commands are not on `PATH`, run:

```powershell
proto setup
```

Install the repository toolchain:

```powershell
proto install --yes
```

Install JavaScript dependencies:

```powershell
proto run pnpm -- install --frozen-lockfile
```

## Daily commands

Run the affected CI entrypoint locally:

```powershell
proto run moon -- ci :build :typecheck :test
```

Run common task groups directly:

```powershell
proto run moon -- run :build
proto run moon -- run :typecheck
proto run moon -- run :test
```

## CI expectations

- Do not vendor `moon_cli` archives or extracted binaries into the repository.
- Do not add a custom Proto plugin for Moon. Moon is a built-in Proto-supported tool.
- Prefer `proto run <tool> -- ...` when you need to make the pinned tool source explicit.
- Keep Moon and Proto version bumps intentional and commit them together when possible.

## Legacy Dagger note

Proto no longer provisions Dagger in this repository. If a legacy Dagger flow is still needed before the full removal work lands, install the `dagger` CLI separately and use the existing `pnpm run dagger ...` scripts.
