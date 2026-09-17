import { t as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./routes-usE4CB28.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-C-RpkgqT.js
var llamaComplete = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("138c1921c097836b4417c5961eed61cb78b4257800b96e3ec26c3ef084e3d97f"));
var llamaProbe = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("e106a9e4b5be14260882fc86f880c167ae67009868fce831e3dab565363a5486"));
//#endregion
export { llamaComplete, llamaProbe };
