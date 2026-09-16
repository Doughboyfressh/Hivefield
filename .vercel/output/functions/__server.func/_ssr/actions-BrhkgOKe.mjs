import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-BrhkgOKe.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var llamaComplete = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("138c1921c097836b4417c5961eed61cb78b4257800b96e3ec26c3ef084e3d97f"));
var llamaProbe = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("e106a9e4b5be14260882fc86f880c167ae67009868fce831e3dab565363a5486"));
//#endregion
export { llamaComplete, llamaProbe };
