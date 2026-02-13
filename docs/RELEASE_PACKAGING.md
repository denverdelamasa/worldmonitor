# Desktop Release Packaging Guide (Local, Reproducible)

This guide provides reproducible local packaging steps for both desktop variants:

- **full** → `World Monitor`
- **tech** → `Tech Monitor`

Variant identity is controlled by Tauri config:

- full: `src-tauri/tauri.conf.json`
- tech: `src-tauri/tauri.tech.conf.json`

## Prerequisites

- Node.js + npm
- Rust toolchain
- OS-native Tauri build prerequisites:
  - macOS: Xcode command-line tools
  - Windows: Visual Studio Build Tools + NSIS + WiX

Install dependencies (this also installs the pinned Tauri CLI used by desktop scripts):

```bash
npm ci
```

All desktop scripts call the local `tauri` binary from `node_modules/.bin`; no runtime `npx` package download is required after `npm ci`.

## Packaging commands

To view script usage/help:

```bash
npm run desktop:package -- --help
```

### macOS (`.app` + `.dmg`)

```bash
npm run desktop:package:macos:full
npm run desktop:package:macos:tech
# or generic runner
npm run desktop:package -- --os macos --variant full
```

### Windows (`.exe` + `.msi`)

```bash
npm run desktop:package:windows:full
npm run desktop:package:windows:tech
# or generic runner
npm run desktop:package -- --os windows --variant tech
```

Bundler targets are pinned in both Tauri configs and enforced by packaging scripts:

- macOS: `app,dmg`
- Windows: `nsis,msi`

## Optional signing/notarization hooks

Unsigned packaging works by default.

If signing credentials are present in environment variables, Tauri will sign/notarize automatically during the same packaging commands.

### macOS Apple Developer signing + notarization

Set before packaging (Developer ID signature):

```bash
export TAURI_BUNDLE_MACOS_SIGNING_IDENTITY="Developer ID Application: Your Company (TEAMID)"
export TAURI_BUNDLE_MACOS_PROVIDER_SHORT_NAME="TEAMID"
# optional alternate key accepted by Tauri tooling:
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Company (TEAMID)"
```

For notarization, choose one auth method:

```bash
# Apple ID + app-specific password
export APPLE_ID="you@example.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAMID"

# OR App Store Connect API key
export APPLE_API_KEY="ABC123DEFG"
export APPLE_API_ISSUER="00000000-0000-0000-0000-000000000000"
export APPLE_API_KEY_PATH="$HOME/.keys/AuthKey_ABC123DEFG.p8"
```

Then run either standard or explicit sign script aliases:

```bash
npm run desktop:package:macos:full
# or
npm run desktop:package:macos:full:sign
```

### Windows Authenticode signing

Set before packaging (PowerShell):

```powershell
$env:TAURI_BUNDLE_WINDOWS_CERTIFICATE_THUMBPRINT="<CERT_THUMBPRINT>"
$env:TAURI_BUNDLE_WINDOWS_TIMESTAMP_URL="https://timestamp.digicert.com"
# optional: if using cert file + password instead of cert store
$env:TAURI_BUNDLE_WINDOWS_CERTIFICATE="C:\path\to\codesign.pfx"
$env:TAURI_BUNDLE_WINDOWS_CERTIFICATE_PASSWORD="<PFX_PASSWORD>"
```

Then run either standard or explicit sign script aliases:

```powershell
npm run desktop:package:windows:full
# or
npm run desktop:package:windows:full:sign
```

## Variant-aware outputs (names/icons)

- Full variant: `World Monitor` / `world-monitor`
- Tech variant: `Tech Monitor` / `tech-monitor`

Distinct names are configured in Tauri:

- `src-tauri/tauri.conf.json` → `World Monitor` / `world-monitor`
- `src-tauri/tauri.tech.conf.json` → `Tech Monitor` / `tech-monitor`

If you want variant-specific icons, set `bundle.icon` separately in each config and point each variant to dedicated icon assets.

## Output locations

Artifacts are produced under:

```text
src-tauri/target/release/bundle/
```

Common subfolders:

- `app/` → macOS `.app`
- `dmg/` → macOS `.dmg`
- `nsis/` → Windows `.exe` installer
- `msi/` → Windows `.msi` installer

## Release checklist (clean machine)

1. Build required OS + variant package(s).
2. Move artifacts to a clean machine (or fresh VM).
3. Install/launch:
   - macOS: mount `.dmg`, drag app to Applications, launch.
   - Windows: run `.exe` or `.msi`, launch from Start menu.
4. Validate startup:
   - App window opens without crash.
   - Map view renders.
   - Initial data loading path does not fatal-error.
5. Validate variant identity:
   - Window title and product name match expected variant.
6. If signing was enabled:
   - Verify code-signing metadata in OS dialogs/properties.
   - Verify notarization/Gatekeeper acceptance on macOS.
