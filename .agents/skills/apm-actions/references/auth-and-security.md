# APM Actions — Auth & Security

## Private Repo Authentication

`github-token` (default `${{ github.token }}`) is auto-forwarded to APM as `GITHUB_APM_PAT`. Same-org private repos work with zero config:

```yaml
- uses: microsoft/apm-action@v1
```

### Cross-org Private Repos

Pass a broader-scoped PAT via `github-token`:

```yaml
- uses: microsoft/apm-action@v1
  with:
    github-token: ${{ secrets.APM_PAT }}
```

### Multi-org / Multi-platform (Full Control)

Use the `env:` block for per-source tokens:

```yaml
- uses: microsoft/apm-action@v1
  env:
    GITHUB_APM_PAT: ${{ secrets.APM_PAT }}
    GITHUB_APM_PAT_CONTOSO: ${{ secrets.APM_PAT_CONTOSO }}
    ADO_APM_PAT: ${{ secrets.ADO_PAT }}
    ARTIFACTORY_APM_TOKEN: ${{ secrets.ARTIFACTORY_TOKEN }}
```

An explicit `GITHUB_APM_PAT` in `env:` always wins over the auto-forwarded `github-token` value.

GitHub Actions forbids secrets named with the `GITHUB_` prefix, so a secret literally called `GITHUB_APM_PAT` can't be created. Name cross-org secrets `APM_PAT` (or similar) and pass them via `github-token` or `env: GITHUB_APM_PAT`.

## Security Scanning (`audit-report`)

`apm install` already blocks packages with critical hidden-character (hidden Unicode) findings — no configuration needed. `audit-report` adds visibility: a SARIF report for [Code Scanning](https://docs.github.com/en/code-security/code-scanning) annotations plus a markdown summary in `$GITHUB_STEP_SUMMARY`.

```yaml
- uses: microsoft/apm-action@v1
  id: apm
  with:
    audit-report: true
- uses: github/codeql-action/upload-sarif@v3
  if: always() && steps.apm.outputs.audit-report-path
  with:
    sarif_file: ${{ steps.apm.outputs.audit-report-path }}
    category: apm-audit
```

Works alongside install, update, and pack modes. See the APM security model docs (microsoft.github.io/apm/enterprise/security) for what the scan detects.
