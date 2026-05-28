(function () {
    const state = {
        visible: false,
        elements: [],
        index: 0,
        categories: null,
        categoryIndex: 0,
        path: [],
        sidebar: [],
        sidebarActive: null,
        username: "Onimaru",
        menuColor: "138, 43, 226",
    };

    const menuEl = document.getElementById("shadow-menu");
    const sidebarNav = document.getElementById("sidebar-nav");
    const contentEl = document.getElementById("content");
    const brandEl = document.getElementById("brand");
    const footerEl = document.getElementById("menu-footer");
    const descEl = document.getElementById("desc-toast");
    const inputWrap = document.getElementById("input-wrapper");
    const inputTitle = document.getElementById("input-title");
    const inputValue = document.getElementById("input-value");
    const kblWrap = document.getElementById("kbl-wrapper");
    const kblList = document.getElementById("kbl-list");
    const notifWrap = document.getElementById("notifications");
    const fcWrap = document.getElementById("fc-wrapper");

    function setMenuColor(rgb) {
        if (!rgb) return;
        state.menuColor = rgb;
        document.documentElement.style.setProperty("--menu-color", rgb);
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatSliderValue(entry) {
        const val = entry.value ?? entry.min ?? 0;
        if (Number.isInteger(val)) return String(val);
        return Number(val).toFixed(2).replace(/\.?0+$/, "");
    }

    function scrollableLabel(entry) {
        if (!entry.values || !entry.values.length) return "";
        const idx = Math.max(0, (entry.value || 1) - 1);
        return entry.values[idx] || "";
    }

    function renderControl(entry) {
        const type = entry.type || "button";
        if (type === "checkbox" || type === "scrollable-checkbox" || type === "slider-checkbox") {
            const on = !!entry.checked;
            const extra =
                type === "scrollable-checkbox"
                    ? `<span class="scroll-value">${escapeHtml(scrollableLabel(entry))}</span>`
                    : type === "slider-checkbox"
                      ? `<span class="slider-num">${formatSliderValue(entry)}</span>`
                      : "";
            return `${extra}<div class="toggle ${on ? "on" : ""}"></div>`;
        }
        if (type === "slider") {
            const min = entry.min ?? 0;
            const max = entry.max ?? 100;
            const val = entry.value ?? min;
            const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
            return `<div class="slider-wrap">
                <div class="slider-track">
                    <div class="slider-fill" style="width:${pct}%"></div>
                    <div class="slider-thumb" style="left:${pct}%"></div>
                </div>
                <span class="slider-num">${formatSliderValue(entry)}</span>
            </div>`;
        }
        if (type === "scrollable") {
            return `<span class="scroll-value">${escapeHtml(scrollableLabel(entry))}</span>`;
        }
        if (type === "subMenu") {
            return `<span class="sub-arrow">›</span>`;
        }
        return "";
    }

    function renderRow(entry, rowIndex, isActive) {
        if (entry.type === "divider") {
            return `<div class="menu-row divider-row" data-idx="${rowIndex}">
                <span class="divider-label">${escapeHtml(entry.label || "")}</span>
            </div>`;
        }
        let suffix = "";
        if (entry.locked) suffix += ' <span class="locked">(Locked)</span>';
        if (entry.hazardous) suffix += ' <span class="hazard">(Risk)</span>';
        return `<div class="menu-row type-${entry.type || "button"} ${isActive ? "active" : ""}" data-idx="${rowIndex}">
            <span class="row-label">${escapeHtml(entry.label || "")}${suffix}</span>
            <div class="row-control">${renderControl(entry)}</div>
        </div>`;
    }

    function visibleCategoryPair() {
        const cats = state.categories;
        if (!cats || !cats.length) return null;
        if (cats.length <= 2) return { cats, activeCol: state.categoryIndex };
        const start = Math.min(state.categoryIndex, Math.max(0, cats.length - 2));
        return { cats: cats.slice(start, start + 2), activeCol: state.categoryIndex - start };
    }

    function renderContent() {
        contentEl.innerHTML = "";
        const pair = visibleCategoryPair();

        if (pair && pair.cats.length) {
            const cols = document.createElement("div");
            cols.className = "content-columns";

            pair.cats.forEach((cat, colIdx) => {
                const col = document.createElement("div");
                col.className = "content-column" + (colIdx !== pair.activeCol ? " inactive" : "");
                col.innerHTML = `<div class="column-header">${escapeHtml(cat.label || "Section")}</div>`;
                const list = document.createElement("div");
                list.className = "column-items";

                const tabs = cat.tabs || [];
                const isActiveCol = colIdx === pair.activeCol;
                tabs.forEach((entry, i) => {
                    list.insertAdjacentHTML("beforeend", renderRow(entry, i, isActiveCol && i === state.index));
                });

                col.appendChild(list);
                cols.appendChild(col);
            });

            contentEl.appendChild(cols);
            return;
        }

        const col = document.createElement("div");
        col.className = "content-column";
        const header =
            state.path.length > 1 ? state.path[state.path.length - 1] : state.path[0] || "Menu";
        col.innerHTML = `<div class="column-header">${escapeHtml(header)}</div>`;
        const list = document.createElement("div");
        list.className = "column-items";
        state.elements.forEach((entry, i) => {
            list.insertAdjacentHTML("beforeend", renderRow(entry, i, i === state.index));
        });
        col.appendChild(list);
        contentEl.appendChild(col);
    }

    function renderSidebar() {
        sidebarNav.innerHTML = "";
        const items = state.sidebar.length ? state.sidebar : state.elements;
        const hoveredLabel = state.elements[state.index]?.label;

        items.forEach((entry) => {
            if (entry.type !== "subMenu") return;
            const label = entry.label || "Item";
            const isActive = state.sidebarActive
                ? state.sidebarActive === label
                : hoveredLabel === label;
            const el = document.createElement("div");
            el.className = "sidebar-item" + (isActive ? " active" : "");
            el.innerHTML = `<span class="gear-icon" aria-hidden="true">\u2699</span><span>${escapeHtml(label)}</span>`;
            sidebarNav.appendChild(el);
        });
    }

    function updateDesc() {
        const pair = visibleCategoryPair();
        let entry = null;
        if (pair && pair.cats[pair.activeCol]) {
            entry = pair.cats[pair.activeCol].tabs?.[state.index];
        } else {
            entry = state.elements[state.index];
        }
        const text = entry?.desc || "";
        if (text && state.visible) {
            descEl.textContent = text;
            descEl.classList.add("visible");
        } else {
            descEl.classList.remove("visible");
        }
    }

    function render() {
        if (!menuEl) return;
        menuEl.classList.toggle("visible", state.visible);
        brandEl.textContent = state.username || "Onimaru";
        footerEl.textContent = ".gg/Onimaru";
        renderSidebar();
        renderContent();
        updateDesc();
        requestAnimationFrame(() => {
            document.querySelector(".menu-row.active")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        });
    }

    function applyPayload(data) {
        if (typeof data.username === "string") state.username = data.username;
        if (data.elements) state.elements = data.elements;
        if (typeof data.index === "number") state.index = data.index;
        if (data.categories) state.categories = data.categories;
        else if (data.action === "showUI" && !data.categories) state.categories = null;
        if (typeof data.categoryIndex === "number") state.categoryIndex = data.categoryIndex;
        if (data.path) state.path = data.path;
        if (data.sidebar) state.sidebar = data.sidebar;
        if (data.sidebarActive !== undefined) state.sidebarActive = data.sidebarActive;
        if (data.bannerColor) setMenuColor(data.bannerColor);
    }

    function showNotification(data) {
        const el = document.createElement("div");
        el.className = "notification " + (data.type || "info");
        el.innerHTML = `<div class="notification-title">${escapeHtml(data.title || "Notice")}</div>
            <div class="notification-desc">${escapeHtml(data.desc || data.message || "")}</div>`;
        notifWrap.appendChild(el);
        requestAnimationFrame(() => el.classList.add("show"));
        setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => el.remove(), 400);
        }, data.duration || 3000);
    }

    function renderKeybinds(binds) {
        kblList.innerHTML = "";
        (binds || []).forEach((b) => {
            kblList.insertAdjacentHTML(
                "beforeend",
                `<div class="kbl-row"><span>${escapeHtml(b.label || "")}</span><span>${escapeHtml(b.keyLabel || b.key || "")}</span></div>`
            );
        });
    }

    function parsePayload(raw) {
        if (raw == null) return null;
        if (typeof raw === "string") {
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        }
        if (typeof raw === "object") {
            if (raw.action) return raw;
            if (typeof raw.data === "string") {
                try {
                    return JSON.parse(raw.data);
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    window.addEventListener("message", (event) => {
        const data = parsePayload(event.data);
        if (!data) return;

        switch (data.action) {
            case "showUI":
                state.visible = !!data.visible;
                applyPayload(data);
                if (!data.visible) {
                    setTimeout(() => {
                        state.index = 0;
                        state.categories = null;
                    }, 250);
                }
                render();
                break;
            case "updateElements":
                applyPayload(data);
                render();
                break;
            case "keydown":
                if (typeof data.index === "number") {
                    state.index = data.index;
                    render();
                }
                break;
            case "updateBanner":
                if (data.bannerColor) setMenuColor(data.bannerColor);
                break;
            case "updateKeyboard":
                inputWrap.classList.toggle("visible", !!data.visible);
                if (data.title) inputTitle.textContent = data.title;
                if (data.value !== undefined) inputValue.textContent = data.value;
                break;
            case "displayBinds":
                kblWrap.classList.toggle("visible", !!data.visible);
                if (data.binds) renderKeybinds(data.binds);
                break;
            case "showNotification":
                showNotification(data);
                break;
            case "displayFreecam":
                if (!data.visible) {
                    fcWrap.classList.remove("visible");
                    fcWrap.innerHTML = "";
                } else {
                    fcWrap.classList.add("visible");
                    const opts = ["Default", "Teleport", "Shoot Weapon", "Kick from Vehicle", "Hijack Vehicle", "Delete Vehicle"];
                    fcWrap.innerHTML = opts
                        .map((o, i) => `<div class="fc-option ${i === 0 ? "selected" : ""}">${escapeHtml(o)}</div>`)
                        .join("");
                }
                break;
            default:
                break;
        }
    });

    setMenuColor(state.menuColor);
    render();
})();
