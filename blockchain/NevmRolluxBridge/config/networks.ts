import contractsDev from "./contracts";

export type NetworkData = {
    rpcAddress: string,
    name: string,
    explorerUrl: string,
    chainId: number,
    layer: number,
    contracts: { [key: string]: string }
}



export const networksMap: { [key: string]: string } = {
    'L1Dev': 'RolluxBedrockDev',
    'RolluxBedrockDev': 'L1Dev',
    'L1': 'Rollux',
    'Rollux': 'L1',
};

export enum SelectedNetworkType {
    Mainnet,
    Testnet,
    Unsupported
}

export const ChainIdsToNetworksMap: { [key: number]: SelectedNetworkType } = {
    // testnet
    5700: SelectedNetworkType.Testnet,
    57000: SelectedNetworkType.Testnet,
    // mainnet todo fill correct chain Ids
    57: SelectedNetworkType.Mainnet,
    570: SelectedNetworkType.Mainnet
}



export const networks: { [key: string]: NetworkData } = {
    L1: {
        rpcAddress: 'https://rpc.syscoin.org',
        name: 'L1',
        explorerUrl: 'https://explorer.syscoin.org/',
        chainId: 57,
        layer: 1,
        contracts: contractsDev.l1,
    },
    L2: {
        rpcAddress: 'https://rpc.rollux.com',
        name: 'Rollux',
        explorerUrl: 'https://explorer.rollux.com',
        chainId: 570,
        layer: 2,
        contracts: contractsDev.l2,
    },
    L1Dev: {
        rpcAddress: 'https://rpc.tanenbaum.io',
        name: 'L1Dev',
        explorerUrl: 'https://explorer.tanenbaum.io',
        chainId: 5700,
        layer: 1,
        contracts: contractsDev.l1_dev,
    },
    L2Dev: {
        rpcAddress: 'https://rpc-tanenbaum.rollux.com',
        name: 'RolluxBedrockDev',
        explorerUrl: 'https://rollux.tanenbaum.io',
        chainId: 57000,
        layer: 2,
        contracts: contractsDev.l2_dev,
    }
}

export const NetworkSwitchMap: {
    [key in SelectedNetworkType]: {
        L1: number,
        L2: number
    }
} = {
    [SelectedNetworkType.Mainnet]: {
        L1: 57,
        L2: 570,
    },
    [SelectedNetworkType.Testnet]: {
        L1: 5700,
        L2: 57000,
    },
    [SelectedNetworkType.Unsupported]: {
        L1: 0,
        L2: 0
    }
}

export const getNetworkByChainId = (chainId: number, networks: { [key: string]: NetworkData }): NetworkData | undefined => {
    let found: NetworkData | undefined = undefined;

    Object.keys(networks).forEach(element => {
        const network: NetworkData = networks[element];

        if (network.chainId === chainId && typeof found === 'undefined') {
            found = network;
        }
    });

    return found;
}

export const getNetworkByName = (name: string, networks: { [key: string]: NetworkData }): NetworkData | undefined => {
    let found: NetworkData | undefined = undefined;

    Object.keys(networks).forEach(element => {
        const network: NetworkData = networks[element];

        if (network.name === name && typeof found === 'undefined') {
            found = network;
        }
    });

    return found;
}