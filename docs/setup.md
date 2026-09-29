# Local setup (macOS)

Everything below runs in Terminal (Cmd+Space, type "Terminal") or in VS Code's terminal (Ctrl+`). Postgres, TimescaleDB, Redis and Grafana are **not** installed on the Mac: they run in Docker containers.

## Tools

| Tool | What it's for | Check command | Needed by |
| --- | --- | --- | --- |
| Homebrew | Installs everything else | `brew --version` | Now |
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

```bash
brew install git fnm pnpm gh awscli uv k6
brew install --cask visual-studio-code
brew tap hashicorp/tap && brew install hashicorp/tap/terraform
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
source ~/.zshrc
fnm install 24 && fnm default 24
gh auth login && gh auth setup-git
```

Docker Desktop: download "Docker Desktop for Mac with Apple silicon" (or "with Intel chip") from https://docs.docker.com/desktop/setup/install/mac-install/

Claude Code CLI: `curl -fsSL https://claude.ai/install.sh | bash`

## Check everything at once

```bash
for c in git node pnpm docker terraform aws gh k6 uv fnm code claude; do
  if command -v $c >/dev/null 2>&1; then
    printf "%-10s " $c
    case $c in terraform) terraform -version | head -1;; k6) k6 version;; *) $c --version | head -1;; esac
  else echo "$c: NOT INSTALLED"; fi
done
docker compose version
```

## Update

- Homebrew tools: `brew upgrade`
- Node: `fnm install 24` pulls the newest 24.x
- Docker Desktop and Claude Code (native install) update themselves

## Fixes that already came up

| Symptom | Fix |
| --- | --- |
| `docker: command not found` | Quit and reopen the terminal. Still missing: `echo 'export PATH="$HOME/.docker/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`, or Docker Desktop → Settings → Advanced → System |
| `claude: command not found` | `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc` |
| `code: command not found` | In VS Code: Cmd+Shift+P → "Shell Command: Install 'code' command in PATH" |

## Mac tips

- Keep code in `~/code`, not on the Desktop or in Documents, which iCloud may sync.
- Cmd replaces Ctrl for copy, paste and save. In Terminal, Ctrl+C still stops a running program.
- Cmd+Shift+. in Finder shows hidden files like `.env` and `.zshrc`.
