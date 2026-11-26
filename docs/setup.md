# Local setup (Windows)

Everything below runs in PowerShell (press the Windows key, type "PowerShell") or in VS Code's terminal (Ctrl+`). Run one line at a time: Windows PowerShell 5.1 doesn't support `&&`. Postgres, TimescaleDB, Redis and Grafana are **not** installed on Windows: they run in Docker containers.

## Tools

| Tool | What it's for | Check command | Needed by |
| --- | --- | --- | --- |
| winget | Installs everything else (built into Windows) | `winget --version` | Now |
| Git | Version control | `git --version` | Now |
| VS Code | Editor | `code --version` | Now |
| Docker Desktop | Runs Postgres, Redis, Grafana locally | `docker --version` and `docker compose version` | Now |
| fnm | Keeps Node on the version in `.nvmrc` | `fnm --version` | Now |
| Node.js 24 LTS | Runs the whole stack | `node --version` (want v24.x) | Now |
| pnpm | Monorepo package manager | `pnpm --version` | Now |
| GitHub CLI | Login, repos, Actions from the terminal | `gh --version` and `gh auth status` | Now |
| Claude Code | Coding assistant | `claude --version` | Now |
| Terraform | Infrastructure as code | `terraform -version` | Phase 1 |
| AWS CLI v2 | Talks to your AWS account | `aws --version` (want aws-cli/2.x) | Phase 1 |
| uv | Python for analysis notebooks | `uv --version` | Phase 3 |
| k6 | Load testing | `k6 version` | Phase 4 |

## Install (once)

If winget asks you to agree to its terms, type `Y`. Docker Desktop asks for administrator permission; click Yes.

```powershell
winget install -e --id Git.Git
winget install -e --id Microsoft.VisualStudioCode
winget install -e --id Schniz.fnm
winget install -e --id GitHub.cli
winget install -e --id Docker.DockerDesktop
irm https://claude.ai/install.ps1 | iex
```

Close PowerShell and open a new window (restart Windows instead if Docker asks), then set up Node 24:

```powershell
fnm install 24
fnm default 24
if (!(Test-Path $PROFILE)) { New-Item $PROFILE -Force }
Add-Content $PROFILE 'fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression'
```

Close PowerShell and open a new window again. Check that `node --version` says v24, then:

```powershell
npm install -g pnpm@12.6.0
gh auth login
```

For `gh auth login`, choose GitHub.com, HTTPS, Yes to authenticating Git, then "Login with a web browser".

Open Docker Desktop once from the Start menu and finish its setup screens.

Install these when the project reaches the phase that needs them:

```powershell
winget install -e --id Hashicorp.Terraform   # Phase 1
winget install -e --id Amazon.AWSCLI         # Phase 1
winget install -e --id astral-sh.uv          # Phase 3
winget install -e --id k6.k6                 # Phase 4
```

## Get the code

```powershell
cd ~
git clone https://github.com/ftchristian/headway.git
cd headway
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

The repo lives at `C:\Users\<you>\headway`. Start Claude Code from that folder with `claude`.

## Check everything at once

```powershell
foreach ($c in 'git','node','pnpm','docker','terraform','aws','gh','k6','uv','fnm','code','claude') {
  if (Get-Command $c -ErrorAction SilentlyContinue) {
    $v = if ($c -eq 'terraform') { terraform -version | Select-Object -First 1 } elseif ($c -eq 'k6') { k6 version } else { & $c --version | Select-Object -First 1 }
    '{0,-10} {1}' -f $c, $v
  } else { "${c}: NOT INSTALLED" }
}
docker compose version
```

## Start the local databases

Postgres (with TimescaleDB and PostGIS) and Redis run in Docker. Open Docker Desktop first, then in PowerShell from your headway folder (`C:\Users\<you>\headway`):

```powershell
Copy-Item .env.example .env   # once; .env is never committed
pnpm infra:up                 # starts both and waits until they are healthy
```

The first start downloads about 700 MB of images. Both are reachable only from this PC: Postgres on `localhost:5432`, Redis on `localhost:6379`.

| Command | What it does |
| --- | --- |
| `pnpm infra:up` | Start both databases |
| `pnpm infra:down` | Stop them; data is kept |
| `pnpm infra:logs` | Follow their logs (Ctrl+C to stop following) |
| `pnpm infra:psql` | SQL prompt inside Postgres (`\q` to quit) |
| `pnpm infra:redis` | Redis prompt (`quit` to leave) |

To wipe all local data and start fresh: `docker compose --env-file .env -f infra/docker/compose.dev.yml down -v`. This deletes everything in both databases.

## Update

- winget tools: `winget upgrade --all`
- Node: `fnm install 24` pulls the newest 24.x
- Docker Desktop and Claude Code (native install) update themselves

## Fixes that already came up

| Symptom | Fix |
| --- | --- |
| `pnpm`, `gh` or `docker` "is not recognized" right after installing | Close PowerShell and open a new window. New installs only show up in new windows. |
| `claude` "is not recognized" | The installer didn't add its folder to your PATH. Run `[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + ";$env:USERPROFILE\.local\bin", 'User')`, then open a new PowerShell window. |
| "running scripts is disabled on this system" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then open a new PowerShell window. |
| `node --version` still shows an older version | The fnm line in your PowerShell profile isn't running. Fix the "running scripts is disabled" error above, then open a new window. |
| "The token '&&' is not a valid statement separator" | Windows PowerShell 5.1 doesn't support `&&`. Run the commands on separate lines. |

## Windows tips

- Keep code in your user folder (`C:\Users\<you>`), not on the Desktop, in Documents or in OneDrive, which OneDrive may sync.
- Paste into PowerShell with Ctrl+V or a right-click. Ctrl+C stops a running program.
- Turn on file extensions in File Explorer (View → Show → File name extensions). Otherwise `.env.example` shows up as `.env` and the two are easy to mix up.
- pnpm runs `package.json` scripts through cmd.exe on Windows, so scripts must avoid Mac/Linux-only shell syntax (see Conventions in `CLAUDE.md`).
