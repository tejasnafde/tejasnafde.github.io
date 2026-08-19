# Handover: build a new tn07 app surface

Use this for an installed app or a new installed surface of an existing
product. Fill the fields first.

```
PROJECT:       <repo dir under ~/Desktop/projects>
PRODUCT:       <registered product name>
SURFACE:       browser engine | native widgets | hybrid
PLATFORMS:     <for example iOS, Android, macOS>
MINIMUM OS:    <versions>
```

## Read first

1. <https://tn07.dev/design/STYLE.md> - visual identity and shared semantics.
2. <https://tn07.dev/design/APP_STYLE.md> - installed-shell mechanics.
3. The product's row in the identity table in `STYLE.md`.
4. The consuming repo's `AGENTS.md` or `CLAUDE.md`.

Add links to the first two contracts in the consuming repo instructions if
they are absent. Do not copy either contract into the app repo.

## Start from the platform boundary

State which layer renders each surface. Electron and WebViews are browser-engine
surfaces even though they ship inside an app. React Native, Expo, SwiftUI and
Compose are native-widget surfaces. A hybrid app may contain both.

Create one token adapter for each real rendering technology. Map semantic names
from `APP_STYLE.md`; do not invent a second palette or spacing scale. Include an
automated parity check or generated snapshot so drift fails visibly.

Bundle required tokens and fonts. An installed app must launch with its intended
theme while offline.

## Device-only verification

Record evidence only for behavior that emulation cannot prove:

| Rule | Device and OS | Date | Result |
|---|---|---|---|
| Safe-area and system-bar integration | | | |
| Keyboard keeps field, error and action visible | | | |
| Pressed feedback and platform back gesture | | | |
| Large text does not clip | | | |
| Reduced motion is respected | | | |

For a browser-engine mobile surface, also record focus zoom, address-bar resize,
tap feedback and pull-to-refresh behavior. Remove rows that cannot apply; do not
mark them "not tested".

## Definition of done

- Rendering technology is named for every surface.
- Identity matches the registered `STYLE.md` row.
- Platform adapter maps shared semantics and has a parity check.
- Safe areas, keyboard, system bars, pointer, touch and accessibility behavior
  follow `APP_STYLE.md`.
- Offline launch preserves tokens and fonts.
- Device-only claims carry device, OS and date evidence.
- No local style contract duplicates the shared files.
