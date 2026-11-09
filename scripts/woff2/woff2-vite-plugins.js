// define `EXCALIDRAW_ASSET_PATH` as a SSOT
const OSS_FONTS_CDN = "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/oss/";
const OSS_FONTS_FALLBACK = "/";

/**
 * Custom vite plugin for auto-prefixing `EXCALIDRAW_ASSET_PATH` woff2 fonts in `excalidraw-app`.
 *
 * @returns {import("vite").PluginOption}
 */
module.exports.woff2BrowserPlugin = () => {
  let isDev;
  // the desktop build must not reach out to a CDN, it only uses bundled fonts
  let isDesktop;

  return {
    name: "woff2BrowserPlugin",
    enforce: "pre",
    config(_, { command, mode }) {
      isDev = command === "serve";
      isDesktop = mode === "desktop";
    },
    transform(code, id) {
      // using copy / replace as fonts defined in the `.css` don't have to be manually copied over (vite/rollup does this automatically),
      // but at the same time can't be easily prefixed with the `EXCALIDRAW_ASSET_PATH` only for the `excalidraw-app`
      const fontsBase = isDesktop ? "/" : OSS_FONTS_CDN;
      const cdnSrc = (weight) =>
        isDesktop
          ? ""
          : `url(${OSS_FONTS_CDN}fonts/Assistant/Assistant-${weight}.woff2) format("woff2"), `;
      // the desktop build has no CDN to fall back to, so it must bundle the
      // actual files (only `Regular` is also copied to `public/`)
      const localSrc = (weight) =>
        `url(./${
          isDesktop ? "Assistant/" : ""
        }Assistant-${weight}.woff2) format("woff2")`;

      if (!isDev && id.endsWith("/excalidraw/fonts/fonts.css")) {
        return `/* WARN: The following content is generated during excalidraw-app build */

      @font-face {
        font-family: "Assistant";
        src: ${cdnSrc("Regular")}${localSrc("Regular")};
        font-weight: 400;
        style: normal;
        display: swap;
      }

      @font-face {
        font-family: "Assistant";
        src: ${cdnSrc("Medium")}${localSrc("Medium")};
        font-weight: 500;
        style: normal;
        display: swap;
      }

      @font-face {
        font-family: "Assistant";
        src: ${cdnSrc("SemiBold")}${localSrc("SemiBold")};
        font-weight: 600;
        style: normal;
        display: swap;
      }

      @font-face {
        font-family: "Assistant";
        src: ${cdnSrc("Bold")}${localSrc("Bold")};
        font-weight: 700;
        style: normal;
        display: swap;
      }`;
      }

      if (!isDev && id.endsWith("excalidraw-app/index.html")) {
        return code.replace(
          "<!-- PLACEHOLDER:EXCALIDRAW_APP_FONTS -->",
          `<script>
        // point into our CDN in prod, fallback to root (excalidraw.com) domain in case of issues
        window.EXCALIDRAW_ASSET_PATH = ${
          isDesktop
            ? `"${OSS_FONTS_FALLBACK}"`
            : `[
          "${OSS_FONTS_CDN}",
          "${OSS_FONTS_FALLBACK}",
        ]`
        };
      </script>

      <!-- Preload all default fonts to avoid swap on init -->
      <link
        rel="preload"
        href="${fontsBase}fonts/Excalifont/Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
      />
      <!-- For Nunito only preload the latin range, which should be good enough for now -->
      <link
        rel="preload"
        href="${fontsBase}fonts/Nunito/Nunito-Regular-XRXI3I6Li01BKofiOc5wtlZ2di8HDIkhdTQ3j6zbXWjgeg.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
      />
      <link
        rel="preload"
        href="${fontsBase}fonts/Assistant/Assistant-SemiBold.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
      />
      <link
        rel="preload"
        href="${fontsBase}fonts/ComicShanns/ComicShanns-Regular-279a7b317d12eb88de06167bd672b4b4.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
      />
    `,
        );
      }
    },
  };
};
