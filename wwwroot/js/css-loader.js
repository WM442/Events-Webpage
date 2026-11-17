/*
 * Development CSS loader for the starter pages.
 *
 * Browsers can keep an old stylesheet after a small CSS edit, forcing a
 * hard reload. This loader therefore loads each local stylesheet with a
 * fresh `v=<current time>` query value on every page load. It also fetches
 * CSS files referenced with @import and inlines the imported rules after
 * giving their URLs the same cache-busting treatment, so @imported CSS is
 * refreshed too.
 *
 * Usage in a page <head>:
 *   <script src="js/css-loader.js" data-css="css/site.css"></script>
 *
 * Load more than one local file with a comma-separated list:
 *   data-css="css/site.css, css/events.css"
 */
(() => {
    "use strict";

    const loaderScript = document.currentScript;
    const version = Date.now().toString();
    const stylesheets = (loaderScript?.dataset.css || "css/site.css")
        .split(",")
        .map((href) => href.trim())
        .filter(Boolean);

    const importPattern = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^)\s;]+))\s*\)?\s*([^;]*);/gi;

    function withVersion(url) {
        const result = new URL(url.href);
        result.searchParams.set("v", version);
        return result;
    }

    function rewriteRelativeUrls(css, stylesheetUrl) {
        return css.replace(
            /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)]+?))\s*\)/gi,
            (match, doubleQuoted, singleQuoted, bare) => {
                const value = (doubleQuoted || singleQuoted || bare || "").trim();
                if (!value || /^(?:data:|blob:|https?:|#|\/)/i.test(value)) {
                    return match;
                }
                return `url("${new URL(value, stylesheetUrl).href}")`;
            });
    }

    function takeSupportsCondition(text) {
        const match = /\bsupports\s*\(/i.exec(text);
        if (!match) return { condition: null, rest: text };

        const start = match.index + match[0].length - 1;
        let depth = 0;
        for (let i = start; i < text.length; i++) {
            if (text[i] === "(") depth++;
            if (text[i] === ")") depth--;
            if (depth === 0) {
                return {
                    condition: text.slice(start, i + 1),
                    rest: (text.slice(0, match.index) + text.slice(i + 1)).trim()
                };
            }
        }
        return { condition: null, rest: text };
    }

    function wrapImportedCss(css, qualifiers) {
        if (!qualifiers.trim()) return css;

        const supports = takeSupportsCondition(qualifiers);
        let rest = supports.rest;
        let layerName = null;
        const layerMatch = rest.match(/\blayer(?:\s+([^\s;]+))?/i);
        if (layerMatch) {
            layerName = layerMatch[1] || "";
            rest = rest.replace(layerMatch[0], "").trim();
        }

        let wrapped = css;
        if (rest) wrapped = `@media ${rest} {\n${wrapped}\n}`;
        if (supports.condition) wrapped = `@supports ${supports.condition} {\n${wrapped}\n}`;
        if (layerName !== null) wrapped = `@layer ${layerName ? `${layerName} ` : ""}{\n${wrapped}\n}`;
        return wrapped;
    }

    async function loadCss(input, baseUrl, loadingStack = new Set()) {
        const sourceUrl = new URL(input, baseUrl);
        const key = sourceUrl.href;
        if (loadingStack.has(key)) return "";
        loadingStack.add(key);

        try {
            const response = await fetch(withVersion(sourceUrl), { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Could not load ${sourceUrl.href}: HTTP ${response.status}`);
            }

            const css = (await response.text()).replace(/@charset\s+("[^"]+"|'[^']+')\s*;/gi, "");
            const matches = [...css.matchAll(importPattern)];
            let output = "";
            let lastIndex = 0;

            for (const match of matches) {
                output += rewriteRelativeUrls(css.slice(lastIndex, match.index), sourceUrl);

                const imported = match[1] || match[2] || match[3];
                const qualifiers = (match[4] || "").trim();
                const importedUrl = new URL(imported, sourceUrl);

                if (importedUrl.origin !== globalThis.location.origin) {
                    // External imports (for example a font CDN) cannot always
                    // be fetched/inlined because of their own CORS policy.
                    // Keep the import, but still cache-bust its URL.
                    const separator = qualifiers ? " " : "";
                    output += `@import url("${withVersion(importedUrl).href}")${separator}${qualifiers};\n`;
                } else {
                    const importedCss = await loadCss(importedUrl.href, sourceUrl, loadingStack);
                    output += wrapImportedCss(importedCss, qualifiers);
                }
                lastIndex = match.index + match[0].length;
            }

            output += rewriteRelativeUrls(css.slice(lastIndex), sourceUrl);
            return output;
        } finally {
            loadingStack.delete(key);
        }
    }

    function addFallbackLink(href) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = withVersion(new URL(href, document.baseURI)).href;
        document.head.append(link);
    }

    (async () => {
        for (const href of stylesheets) {
            const style = document.createElement("style");
            style.dataset.cssLoaderSource = href;
            document.head.append(style);

            try {
                style.textContent = await loadCss(href, document.baseURI);
            } catch (error) {
                style.remove();
                console.warn(`CSS loader could not inline ${href}; using a normal timestamped link instead.`, error);
                addFallbackLink(href);
            }
        }
    })();
})();
