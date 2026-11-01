# Releasing Chromasync on Android

The web app deploys itself on every push to `main`. The Android app is released from a **git tag**: pushing `vX.Y.Z` runs two workflows:

- **Deploy Android to Google Play** (`deploy-playstore.yml`): builds a signed App Bundle (AAB), uploads it with its R8 mapping file to the chosen Play track (`internal` by default), and keeps it as a workflow artifact.
- **Build & Publish Direct Android APK Release** (`release-apk.yml`): builds a signed APK and attaches it to a GitHub release.

Every pull request also compiles the Android app (CI job `android`), so native build problems show up before release day.

## Versions

- `versionName` is the tag without its `v` (`v1.1.0` → `1.1.0`). Keep `package.json`'s version in sync.
- `versionCode` is the number of commits on the released branch. It only ever increases, as Google Play requires.

## One-time setup

### 1. Create the upload keystore (keep it forever, back it up)

```bash
keytool -genkeypair -v -keystore chromasync-upload.jks -alias chromasync -keyalg RSA -keysize 4096 -validity 10000
```

Never commit it (`*.jks` is in `.gitignore`).

### 2. Add the GitHub secrets

Repository → Settings → Secrets and variables → Actions:

| Secret | Value |
|:---|:---|
| `ANDROID_KEYSTORE_BASE64` | output of `base64 -w0 chromasync-upload.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `chromasync` (the alias used above) |
| `ANDROID_KEY_PASSWORD` | key password |
| `PLAY_STORE_JSON_KEY` | JSON key of a Google Cloud service account invited in Play Console with "Release to testing tracks" (and production if wanted). Optional: without it, the signed AAB is only kept as a workflow artifact. |

### 3. Create the app in Play Console (manual, once)

Google Play's API cannot create an app or its first release:

1. Create the app *Chromasync*, package `com.chromasync.app`, free, category Health & Fitness.
2. Enroll in **Play App Signing** (default). The keystore above becomes your *upload* key.
3. Fill the store listing from `fastlane/metadata/android/<lang>/`: texts (`title.txt`, `short_description.txt`, `full_description.txt`) and graphics (`images/icon.png`, `images/featureGraphic.png`, `images/phoneScreenshots/*.png`), for English and French.
4. App content: privacy policy `https://chromasync-app.web.app/privacy`, no ads, data safety "no data collected or shared", content rating questionnaire (Everyone), health declaration (wellness / relaxation, not a medical device). See also `DISTRIBUTION_KIT.md` section 0.
5. Upload the **first** AAB by hand to the internal testing track: run the Play workflow once (Actions → Deploy Android to Google Play → Run workflow) and download the `chromasync-aab-*` artifact.

From then on, tags upload automatically.

## Releasing

```bash
npm version 1.2.0 --no-git-tag-version   # bump package.json + lockfile
git commit -am "chore: release 1.2.0"
git tag v1.2.0
git push origin main --tags
```

Then promote the build from *internal* to *production* in Play Console once it has been checked on a real device.

## Regenerating store assets

Icons and splash screens in `android/app/src/main/res` and `fastlane/metadata/android/*/images` were generated from `public/icon.svg`. Screenshots are 1080×2160 captures of the app (Play allows at most a 2:1 ratio).
