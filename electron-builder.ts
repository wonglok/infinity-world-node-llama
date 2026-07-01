// import path from "node:path";
// import { $ } from "zx";
import type { Configuration } from "electron-builder";
import { handler } from "./scripts/nota.mjs";

const appId = "com.wonglok.infinity-ai";
const productName = "infinity-ai world";
const executableName = "infinity-ai-world";
const appxIdentityName = "infinity-ai.wonglok.com";

/**
 * @see - https://www.electron.build/configuration/configuration
 */
export default {
    appId: appId,
    asar: true,
    productName: productName,
    executableName: executableName,
    directories: {
        output: "release",
    },
    icon: "./resource/icon.png",

    // remove this once you set up your own code signing for macOS
    async afterPack(context) {
        //
        //
        // if (context.electronPlatformName === "darwin") {
        //     console.log("begin sign");
        //     // check whether the app was already signed
        //     const appPath = path.join(
        //         context.appOutDir,
        //         `${context.packager.appInfo.productFilename}.app`,
        //     );
        //     console.log("appPath", appPath);
        //     // // this is needed for the app to not appear as "damaged" on Apple Silicon Macs
        //     // // https://github.com/electron-userland/electron-builder/issues/5850#issuecomment-1821648559
        //     await $`codesign --force --deep --sign - ${appPath}`;
        //     console.log("done sign");
        // }
        //
        // "./scripts/nota.mjs"
    },
    afterSign: async (context) => {
        await handler();
    },
    files: [
        "dist",
        "dist-electron",
        "!node_modules/node-llama-cpp/bins/**/*",
        "node_modules/node-llama-cpp/bins/${os}-${arch}*/**/*",
        "!node_modules/node-llama-cpp/llama/localBuilds/**/*",
        "node_modules/node-llama-cpp/llama/localBuilds/${os}-${arch}*/**/*",
        "!node_modules/@node-llama-cpp/*/bins/**/*",
        "node_modules/@node-llama-cpp/${os}-${arch}*/bins/**/*",
    ],
    asarUnpack: [
        "node_modules/node-llama-cpp/bins",
        "node_modules/node-llama-cpp/llama/localBuilds",
        "node_modules/@node-llama-cpp/*",
    ],

    dmg: {
        sign: false,
    },
    mac: {
        target: [
            // {
            //     target: "dmg",
            //     arch: ["arm64", "x64"],
            // },
            //
            {
                target: "zip",
                arch: ["arm64"], // , "x64"
            },
        ],
        sign: null,
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: "build/entitlements.mac.plist",
        entitlementsInherit: "build/entitlements.mac.plist",
        extendInfo: {
            NSCameraUsageDescription:
                "Application requests access to the device's camera.",
            NSMicrophoneUsageDescription:
                "Application requests access to the device's microphone.",
            NSDocumentsFolderUsageDescription:
                "Application requests access to the user's Documents folder.",
            NSDownloadsFolderUsageDescription:
                "Application requests access to the user's Downloads folder.",
        },
        notarize: true,

        artifactName: "${name}.macOS.${version}.${arch}.${ext}",
    },
    win: {
        target: [
            {
                target: "nsis",
                arch: ["x64", "arm64"],
            },
        ],

        forceCodeSigning: false,
        verifyUpdateCodeSignature: false,

        artifactName: "${name}.Windows.${version}.${arch}.${ext}",
    },
    appx: {
        identityName: appxIdentityName,
        artifactName: "${name}.Windows.${version}.${arch}.${ext}",
    },
    nsis: {
        oneClick: true,
        perMachine: false,
        allowToChangeInstallationDirectory: false,
        deleteAppDataOnUninstall: true,
    },
    linux: {
        target: [
            {
                target: "AppImage",
                arch: ["x64", "arm64"],
            },
            {
                target: "snap",
                arch: ["x64"],
            },
            {
                target: "deb",
                arch: ["x64", "arm64"],
            },
            {
                target: "tar.gz",
                arch: ["x64", "arm64"],
            },
        ],
        category: "Utility",

        artifactName: "${name}.Linux.${version}.${arch}.${ext}",
    },
} satisfies Configuration as Configuration;
