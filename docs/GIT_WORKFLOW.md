# Git Workflow

## Branch model

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready only. Protected. |
| `dev` | Integration branch for active development. |
| `test` | QA / staging. |
| `feature/*` | Individual features. |
| `fix/*` | Bug fixes. |
| `chore/*` | Tooling, config, docs. |
| `release/*` | Release preparation. |
| `hotfix/*` | Urgent production fixes. |

### Create the long-lived branches

```bash
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
git checkout main
git checkout -b test
git push -u origin test
```

## Commit style — Conventional Commits

```
feat: add Firebase authentication flow
feat: add Gemini commentary API
fix: prevent invalid lane allocation
test: add game engine unit tests
refactor: extract game engine from UI
docs: add Firebase setup guide
chore: configure CI pipeline
style: redesign dashboard cards
```

## Pull request flow

1. Branch from `dev`: `git checkout dev && git checkout -b feature/my-feature`.
2. Commit small, logical changes.
3. Push and open a PR into `dev` (use the PR template).
4. CI must pass (typecheck, lint, test, build).
5. Review, then merge.
6. Promote `dev` → `test` for QA.
7. Promote `test` → `main` for production.

## Releases

- Cut `release/x.y.z` from `dev`, stabilize, then merge to `main` and tag `vx.y.z`.
- Back-merge `main` into `dev` after release.

## Rollback

- Revert the offending merge commit on `main` (`git revert -m 1 <sha>`) and redeploy.
- For urgent fixes, branch `hotfix/*` from `main`, fix, PR to `main`, then back-merge to
  `dev`/`test`.

## Recommended branch protection (GitHub)

- Require a PR before merging to `main`.
- Require status checks (CI) to pass.
- Restrict direct pushes to `main`.
- Prefer squash merge / linear history.
- Require at least one review when possible.

## Templates

- PR: `.github/pull_request_template.md`
- Issues: `.github/ISSUE_TEMPLATE/{bug_report,feature_request,task}.md`
