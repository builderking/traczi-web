## Custom attribute: ui.allowedLanguages

- **What**: Comma-separated list of language codes (e.g., `en,fa,ar`) that limits available UI languages.
- **Where to add**: Server attributes (Admin → Settings → Server → Attributes) or via Server API as `ui.allowedLanguages`.
- **Effect**: All language selectors show only these languages. The active language, URL `?locale`, and persisted preference are clamped to this list. To hide the login selector use `ui.disableLoginLanguage=true`; to force one language use `language=<code>`.
