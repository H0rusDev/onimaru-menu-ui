# Onimaru Shadow UI (GitHub Pages)

Develop the menu UI in this folder. Macho loads it from your **GitHub Pages** URL over HTTPS.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell |
| `shadow.css` | Shadow theme styles |
| `app.js` | DUI message handler (`showUI`, `updateElements`, etc.) |

Edit these locally, push to GitHub, wait ~1–2 minutes for Pages to update, then reload the cheat.

## Deploy to GitHub Pages

### Option A — UI-only repo (recommended)

1. Create a new GitHub repo (e.g. `onimaru-menu-ui`).
2. Upload **only** the contents of this folder to the repo root:
   - `index.html`
   - `shadow.css`
   - `app.js`
   - `.nojekyll`
3. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
4. Save. Your URL will be:
   ```
   https://YOUR_USERNAME.github.io/onimaru-menu-ui/
   ```

### Option B — Subfolder in an existing repo

1. Copy this folder to `/docs` in your repo.
2. **Settings → Pages →** Source: branch `main`, folder **`/docs`**
3. URL:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

## Connect Onimaru.lua

Open `Onimaru.lua` and set (near the top of the DUI section):

```lua
local SHADOW_DUI_URL = "https://YOUR_USERNAME.github.io/onimaru-menu-ui/"
```

Use your real username/repo. Trailing slash is optional (Lua adds it).

If the placeholder is still there, the cheat uses the old remote menu automatically.

## Test in a browser

After Pages is live, open your URL in Chrome/Edge. You should see the dark Onimaru panel (hidden until the game sends `showUI`).  
If the page is blank white, check that `shadow.css` and `app.js` are in the same directory as `index.html` on GitHub.

## DUI messages (for reference)

The Lua client sends JSON via `MachoSendDuiMessage`:

- `showUI` — open/close menu
- `updateElements` — refresh items
- `keydown` — highlight index
- `updateBanner` — theme color (`bannerColor`: `"138, 43, 226"`)
- `updateKeyboard`, `displayBinds`, `showNotification`, `displayFreecam`
