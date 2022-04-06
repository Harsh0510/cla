import { injectJs, injectCss, removeJs, removeCss } from "./injectResource";

const js = process.env.ASSET_ORIGIN + "/public/pdfjs/pdf.js";
const css = process.env.ASSET_ORIGIN + "/public/pdfjs/viewer.css";

export const load = () => Promise.all([injectJs(js), injectCss(css, true)]);
export const unload = () => Promise.all([removeJs(js), removeCss(css)]);
