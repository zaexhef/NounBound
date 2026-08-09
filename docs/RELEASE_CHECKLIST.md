# Release Checklist

## Product and content

- [ ] All launch features match the approved scope
- [ ] All shipped puzzles are approved and fact-checked
- [ ] Tutorial tested with new players
- [ ] Difficulty order calibrated
- [ ] No placeholder text/assets
- [ ] Support and correction process documented

## Engineering

- [ ] Version and unique build number updated
- [ ] Clean production build from release-candidate branch
- [ ] Automated tests pass
- [ ] Manual smoke test passes on iOS and Android
- [ ] Save migration and offline behavior verified
- [ ] Feature flags and production endpoints verified
- [ ] No secrets or debug menus in production
- [ ] Dependency/security review complete
- [ ] Rollback build/content version retained

## Accessibility and privacy

- [ ] Screen-reader flow passes
- [ ] Dynamic text, contrast, touch targets, reduced motion pass
- [ ] Privacy policy matches actual collection
- [ ] App Store privacy and Play Data Safety forms match behavior
- [ ] Analytics, ads, consent, and age treatment reviewed
- [ ] Account deletion path exists if accounts are introduced

## Store materials

- [ ] Final app name and subtitle
- [ ] Icon and platform-sized screenshots
- [ ] Description, keywords, category, age rating
- [ ] Support URL and contact email
- [ ] Privacy policy URL
- [ ] Review notes and test credentials if required
- [ ] Purchase/ad disclosures and restore flow

## Beta gate

- [ ] TestFlight build processed and installed
- [ ] Google Play closed-track build installed
- [ ] Crash-free and performance targets met
- [ ] Feedback triaged
- [ ] Zero blocker/critical issues
- [ ] Go/no-go decision recorded

## Release process

1. Merge only approved changes into release-candidate.
2. Run content, test, privacy, accessibility, and store gates.
3. Create the next unique iOS and Android build numbers.
4. Upload to TestFlight and Google Play closed testing.
5. Verify processed builds on physical devices.
6. Submit to public review only with explicit owner approval.
7. Use staged rollout and monitor launch health.
