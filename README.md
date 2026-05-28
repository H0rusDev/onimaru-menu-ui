# Onimaru Shadow UI (GitHub Pages)

Develop the menu UI in this folder. Macho loads it from your **GitHub Pages** URL over HTTPS.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell |
| `shadow.css` | Shadow theme styles |
| `app.js` | DUI message handler (`showUI`, `updateElements`, etc.) |
| `index.single.html` | All-in-one file — rename to `index.html` on GitHub if CSS/JS 404 |

Edit these locally, push to GitHub, wait ~1–2 minutes for Pages to update, then reload the cheat.

### Easy upload (one file)

If you keep getting a white page, upload **`index.single.html`** and rename it to **`index.html`** on GitHub (delete the old split files). Everything is embedded — no separate CSS/JS to lose.

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

A **white screen is normal** on the plain URL — the menu is hidden until the game sends `showUI`.

To preview the Shadow UI in Chrome/Edge, open:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/?preview=1
```

You should see a dark background and the demo menu.

### White screen troubleshooting

| Problem | Fix |
|--------|-----|
| Plain URL is white | Use `?preview=1` to test, or open the menu in-game with **H** |
| `?preview=1` still white | `shadow.css` / `app.js` are missing or in a subfolder — all 3 files must be in the **same folder** as `index.html` on GitHub |
| Uploaded `onimaru-ui/` folder as a subfolder | Set `SHADOW_DUI_URL` to `https://USER.github.io/REPO/onimaru-ui/` (include `onimaru-ui`) |
| Red error overlay | Re-upload `index.html`, `shadow.css`, `app.js` together |

Check **F12 → Network**: `shadow.css` and `app.js` must be **200**, not 404.

## DUI messages (for reference)

The Lua client sends JSON via `MachoSendDuiMessage`:

- `showUI` — open/close menu
- `updateElements` — refresh items
- `keydown` — highlight index
- `updateBanner` — theme color (`bannerColor`: `"138, 43, 226"`)
- `updateKeyboard`, `displayBinds`, `showNotification`, `displayFreecam`
