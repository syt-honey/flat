declare module "*.svg" {
    // eslint-disable-next-line no-undef
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

declare module "*.mp3";

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        NETLESS_SDK_TOKEN: string;
        NETLESS_APP_IDENTIFIER: string;

        OSS_ACCESS_KEY_ID: string;
        OSS_ACCESS_KEY_SECRET: string;
        OSS_REGION: string;
        OSS_BUCKET: string;
        OSS_FOLDER: string;
        OSS_PREFIX: string;

        AGORA_APP_ID: string;
        AGORA_RESTFUL_ID: string;
        AGORA_RESTFUL_SECRET: string;
        AGORA_OSS_ACCESS_KEY_ID: string;
        AGORA_OSS_ACCESS_KEY_SECRET: string;
        AGORA_OSS_REGION: string;
        AGORA_OSS_BUCKET: string;
        AGORA_OSS_FOLDER: string;
        AGORA_OSS_PREFIX: string;

        WECHAT_APP_ID: string;
        FLAT_SERVER_DOMAIN: string;
    }
}

interface Window {
    AgoraRtcEngine: import("agora-electron-sdk");
}
