# Launch checklist

What still needs a person (accounts, devices, decisions). Code-side items are done and covered by CI; see [RELEASING.md](RELEASING.md) for the store setup itself.

## 1. Protect `main` (10 minutes, GitHub settings)

Settings → Branches → Add branch ruleset for `main`:

- [ ] Require a pull request before merging, with **1 approval** (from someone other than the author)
- [ ] Require status checks to pass: `verify`, `android`, `ios` (CI) and `preview` (web preview)
- [ ] Block force pushes and deletions

Every merge to `main` deploys the website, so this is what stands between a mistake and production. Each PR now gets a preview link (posted as a comment) to try changes on a phone first.

## 2. Test on real devices before submitting

Install the debug APK (CI artifact `chromasync-debug-apk`) and the TestFlight build, on at least one recent and one older/cheaper phone of each platform:

- [ ] First launch: safety notes appear once; "shorter holds" is ticked
- [ ] Haptics on each phase; screen stays on for a 10-minute session; screen can sleep again after pausing
- [ ] Sound with the iPhone silent switch on; music from another app keeps playing underneath
- [ ] Headphones: turn binaural beats on in the Sound panel; left/right audibly different; unplugging does not crash
- [ ] Incoming call / notification / lock screen mid-session: session pauses, resumes on tap
- [ ] Notch and gesture bar: nothing hidden under the status or navigation bars (portrait and landscape, iPad split view)
- [ ] Android back button: closes drawers, then pauses, then exits
- [ ] Battery and heat: note battery % before/after 10 minutes; the phone should stay barely warm. On a slow phone the picture may get softer: that is the adaptive resolution working
- [ ] Airplane mode: the app still opens and works
- [ ] VoiceOver / TalkBack: buttons are named, drawers can be opened and closed, phases are announced briefly

## 3. Keys and recovery

- [ ] Back up the Android upload keystore (`.jks`) and its passwords in two places outside GitHub (password manager + offline copy). Losing it means a key-reset request to Google
- [ ] Keep the App Store Connect `.p8` key in the same place (it can only be downloaded once)

## 4. Rollback plan (know it before you need it)

- **Website**: Firebase console → Hosting → Release history → *Rollback* on the previous release (instant). Or revert the merge commit on `main`.
- **Google Play**: release production updates with a staged rollout (Actions → Deploy Android to Google Play → *rollout* `0.1` = 10% of users). If crashes appear, *Halt rollout* in Play Console; otherwise widen it to 100%.
- **App Store**: enable *Phased release* when submitting; it can be paused for up to 30 days. A bad build cannot be withdrawn from devices that installed it, so the fix is a new build.

## 5. Watch quality without tracking users

The app has no analytics or crash SDK by design. The stores provide crash data anyway:

- [ ] Google Play Console → Quality → Android vitals (crashes, ANRs, battery). The R8 mapping file is uploaded by CI, so stack traces are readable
- [ ] Xcode → Window → Organizer → Crashes (and TestFlight feedback)
- [ ] Check both weekly for the first month, then monthly

## 6. Legal and store administration

- [ ] **Name**: search "Chromasync" in the EUIPO (euipo.europa.eu) and USPTO trademark databases, classes 9 (software) and 44 (health and wellness), before investing in the brand
- [ ] **EU trader status (Digital Services Act)**: both stores ask whether you are a trader. A free app without ads or purchases, published as an individual, is usually *non-trader*; declaring *trader* publishes your address and phone number on the listing
- [ ] **Health positioning**: keep every store text and update note free of medical claims (no "treats", "cures", "lowers blood pressure"). This keeps the app a wellness app rather than a regulated medical device under the EU MDR

## 7. Product decisions (yours)

- [x] **528 Hz and binaural beats** (decided): 528 Hz "Solfeggio" removed (no scientific basis); binaural beats kept as an opt-in, off by default (headphones only, modest evidence); tuning 432 Hz by default, 440 Hz available
- [ ] **One success metric** to watch in the store dashboards, e.g. users who come back within 7 days, rather than adding features
- [ ] **Five short usability sessions**: hand a first-time user the phone, ask them to "do a 3-minute calm breathing session", and watch without helping
