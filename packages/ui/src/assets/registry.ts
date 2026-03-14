export type AssetRegistry = {
    assets: Record<string, string>;
    textures: Record<string, string>;
};

const noise01 = new URL('../../assets/textures/noise-01.svg', import.meta.url).toString();
const noise02 = new URL('../../assets/textures/noise-02.svg', import.meta.url).toString();
const noise03 = new URL('../../assets/textures/noise-03.svg', import.meta.url).toString();
const mesh01 = new URL('../../assets/textures/mesh-01.svg', import.meta.url).toString();

export const defaultAssetRegistry: AssetRegistry = {
    assets: {},
    textures: {
        'panel/noise-01': noise01,
        'panel/noise-02': noise02,
        'panel/noise-03': noise03,
        'panel/mesh-01': mesh01,
    },
};
