# UI text

This fork ships an English-only UI. `en.json` is the single message catalogue:
the app reads it through `src/lib/i18n.ts`, and the main process reads it
through `ipc/overlayI18n.ts` for the in-game overlays and the tray menu. The
German and Chinese catalogues inherited from upstream were removed, and the
fork does not take UI translations.

This is separate from the Warframe game client language. The setting under
Settings > General > Game language, `src/lib/gameLanguage.ts`,
`services/gameLocale.ts` and `src/data/itemNames/` let the app read item names
from a game set to another language. They stay.

## Rules

- Keep placeholder names consistent with the code. The app fills in `{count}`,
  `{item}` and the rest.
- `common.whisperBuy` and `common.whisperSell` are pasted into warframe.market
  trade chat and read by other players, so keep them in the format other
  players expect.
- Leave capitalisation to CSS. Write labels in normal sentence or title case;
  the UI makes text uppercase where it needs to.
- Write an ellipsis as three plain ASCII dots (`...`), not as the single
  ellipsis character (U+2026). A test checks this.
- Every key must be referenced by the app, and every key the app resolves must
  exist. `tests/main/i18n.test.ts` checks both.
