module.exports = [
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
;
}),
"[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setCredentialFeature",
    ()=>setCredentialFeature
]);
function setCredentialFeature(credentials, feature, value) {
    if (!credentials.$source) {
        credentials.$source = {};
    }
    credentials.$source[feature] = value;
    return credentials;
}
}),
"[project]/node_modules/@smithy/property-provider/dist-es/ProviderError.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProviderError",
    ()=>ProviderError
]);
class ProviderError extends Error {
    name = "ProviderError";
    tryNextLink;
    constructor(message, options = true){
        let logger;
        let tryNextLink = true;
        if (typeof options === "boolean") {
            logger = undefined;
            tryNextLink = options;
        } else if (options != null && typeof options === "object") {
            logger = options.logger;
            tryNextLink = options.tryNextLink ?? true;
        }
        super(message);
        this.tryNextLink = tryNextLink;
        Object.setPrototypeOf(this, ProviderError.prototype);
        logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
    }
    static from(error, options = true) {
        return Object.assign(new this(error.message, options), error);
    }
}
}),
"[project]/node_modules/@smithy/property-provider/dist-es/CredentialsProviderError.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CredentialsProviderError",
    ()=>CredentialsProviderError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$property$2d$provider$2f$dist$2d$es$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/property-provider/dist-es/ProviderError.js [app-route] (ecmascript)");
;
class CredentialsProviderError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$property$2d$provider$2f$dist$2d$es$2f$ProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProviderError"] {
    name = "CredentialsProviderError";
    constructor(message, options = true){
        super(message, options);
        Object.setPrototypeOf(this, CredentialsProviderError.prototype);
    }
}
}),
"[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getHomeDir.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHomeDir",
    ()=>getHomeDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const homeDirCache = {};
const getHomeDirCacheKey = ()=>{
    if (process && process.geteuid) {
        return `${process.geteuid()}`;
    }
    return "DEFAULT";
};
const getHomeDir = ()=>{
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"]}` } = process.env;
    if (HOME) return HOME;
    if (USERPROFILE) return USERPROFILE;
    if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;
    const homeDirCacheKey = getHomeDirCacheKey();
    if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["homedir"])();
    return homeDirCache[homeDirCacheKey];
};
}),
"[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getSSOTokenFilepath.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSSOTokenFilepath",
    ()=>getSSOTokenFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getHomeDir.js [app-route] (ecmascript)");
;
;
;
const getSSOTokenFilepath = (id)=>{
    const hasher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha1");
    const cacheName = hasher.update(id).digest("hex");
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getHomeDir$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "sso", "cache", `${cacheName}.json`);
};
}),
"[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getSSOTokenFromFile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSSOTokenFromFile",
    ()=>getSSOTokenFromFile,
    "tokenIntercept",
    ()=>tokenIntercept
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getSSOTokenFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getSSOTokenFilepath.js [app-route] (ecmascript)");
;
;
const tokenIntercept = {};
const getSSOTokenFromFile = async (id)=>{
    if (tokenIntercept[id]) {
        return tokenIntercept[id];
    }
    const ssoTokenFilepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getSSOTokenFilepath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSSOTokenFilepath"])(id);
    const ssoTokenText = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["readFile"])(ssoTokenFilepath, "utf8");
    return JSON.parse(ssoTokenText);
};
}),
"[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/readFile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileIntercept",
    ()=>fileIntercept,
    "filePromises",
    ()=>filePromises,
    "readFile",
    ()=>readFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
;
const filePromises = {};
const fileIntercept = {};
const readFile = (path, options)=>{
    if (fileIntercept[path] !== undefined) {
        return fileIntercept[path];
    }
    if (!filePromises[path] || options?.ignoreCache) {
        filePromises[path] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(path, "utf8");
    }
    return filePromises[path];
};
}),
"[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/externalDataInterceptor.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "externalDataInterceptor",
    ()=>externalDataInterceptor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getSSOTokenFromFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/getSSOTokenFromFile.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/readFile.js [app-route] (ecmascript)");
;
;
const externalDataInterceptor = {
    getFileRecord () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileIntercept"];
    },
    interceptFile (path, contents) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$readFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileIntercept"][path] = Promise.resolve(contents);
    },
    getTokenRecord () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getSSOTokenFromFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenIntercept"];
    },
    interceptToken (id, contents) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$getSSOTokenFromFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tokenIntercept"][id] = contents;
    }
};
}),
"[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromWebToken.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromWebToken",
    ()=>fromWebToken
]);
const fromWebToken = (init)=>async (awsIdentityProperties)=>{
        init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromWebToken");
        const { roleArn, roleSessionName, webIdentityToken, providerId, policyArns, policy, durationSeconds } = init;
        let { roleAssumerWithWebIdentity } = init;
        if (!roleAssumerWithWebIdentity) {
            const { getDefaultRoleAssumerWithWebIdentity } = await __turbopack_context__.A("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/index.js [app-route] (ecmascript, async loader)");
            roleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity({
                ...init.clientConfig,
                credentialProviderLogger: init.logger,
                parentClientConfig: {
                    ...awsIdentityProperties?.callerClientConfig,
                    ...init.parentClientConfig
                }
            }, init.clientPlugins);
        }
        return roleAssumerWithWebIdentity({
            RoleArn: roleArn,
            RoleSessionName: roleSessionName ?? `aws-sdk-js-session-${Date.now()}`,
            WebIdentityToken: webIdentityToken,
            ProviderId: providerId,
            PolicyArns: policyArns,
            Policy: policy,
            DurationSeconds: durationSeconds
        });
    };
}),
"[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromTokenFile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromTokenFile",
    ()=>fromTokenFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$property$2d$provider$2f$dist$2d$es$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/property-provider/dist-es/CredentialsProviderError.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$externalDataInterceptor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/shared-ini-file-loader/dist-es/externalDataInterceptor.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromWebToken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromWebToken.js [app-route] (ecmascript)");
;
;
;
;
;
const ENV_TOKEN_FILE = "AWS_WEB_IDENTITY_TOKEN_FILE";
const ENV_ROLE_ARN = "AWS_ROLE_ARN";
const ENV_ROLE_SESSION_NAME = "AWS_ROLE_SESSION_NAME";
const fromTokenFile = (init = {})=>async (awsIdentityProperties)=>{
        init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromTokenFile");
        const webIdentityTokenFile = init?.webIdentityTokenFile ?? process.env[ENV_TOKEN_FILE];
        const roleArn = init?.roleArn ?? process.env[ENV_ROLE_ARN];
        const roleSessionName = init?.roleSessionName ?? process.env[ENV_ROLE_SESSION_NAME];
        if (!webIdentityTokenFile || !roleArn) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$property$2d$provider$2f$dist$2d$es$2f$CredentialsProviderError$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("Web identity configuration not specified", {
                logger: init.logger
            });
        }
        const credentials = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromWebToken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromWebToken"])({
            ...init,
            webIdentityToken: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$shared$2d$ini$2d$file$2d$loader$2f$dist$2d$es$2f$externalDataInterceptor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["externalDataInterceptor"]?.getTokenRecord?.()[webIdentityTokenFile] ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(webIdentityTokenFile, {
                encoding: "ascii"
            }),
            roleArn,
            roleSessionName
        })(awsIdentityProperties);
        if (webIdentityTokenFile === process.env[ENV_TOKEN_FILE]) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCredentialFeature"])(credentials, "CREDENTIALS_ENV_VARS_STS_WEB_ID_TOKEN", "h");
        }
        return credentials;
    };
}),
"[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromTokenFile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromTokenFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromTokenFile"],
    "fromWebToken",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromWebToken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromWebToken"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromTokenFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromTokenFile.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$web$2d$identity$2f$dist$2d$es$2f$fromWebToken$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromWebToken.js [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e7783aa5._.js.map