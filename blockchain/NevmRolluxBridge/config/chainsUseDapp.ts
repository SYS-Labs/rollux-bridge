import { Chain } from "@usedapp/core";

export const RolluxChainMainnet: Chain = {
    chainId: 570,
    chainName: "Rollux Mainnet",
    isLocalChain: false,
    isTestChain: false,

    nativeCurrency: {
        name: "Syscoin",
        symbol: "SYS",
        decimals: 18,
    },
    multicallAddress: '0xC8A22F92Dd4A50f56Ab1309ea686A4c08d630180',
    multicall2Address: '0xC8A22F92Dd4A50f56Ab1309ea686A4c08d630180',
    getExplorerAddressLink: (address: string) => {
        return address;
    },
    getExplorerTransactionLink: (address: string) => {
        return address;
    },
    rpcUrl: "https://rpc.rollux.com",
    blockExplorerUrl: "https://explorer.rollux.com/",
}

export const NEVMChain: Chain = {
    chainId: 57,
    chainName: "Syscoin NEVM",
    isLocalChain: false,
    isTestChain: false,
    nativeCurrency: {
        name: "Syscoin",
        symbol: "SYS",
        decimals: 18,
    },
    multicallAddress: '',
    getExplorerAddressLink: (address: string) => {
        return address;
    },
    getExplorerTransactionLink: (address: string) => {
        return address;
    },
    rpcUrl: "https://rpc.syscoin.org",
    blockExplorerUrl: "https://explorer.syscoin.org/",
}

export const TanenbaumChain: Chain = {
    chainId: 5700,
    chainName: "Tanenbaum testnet",
    isLocalChain: false,
    isTestChain: true,
    nativeCurrency: {
        name: "tSyscoin",
        symbol: "tSYS",
        decimals: 18,
    },
    multicallAddress: '0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697',
    multicall2Address: '0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697',
    getExplorerAddressLink: (address: string) => {
        return address;
    },
    getExplorerTransactionLink: (address: string) => {
        return address;
    },
    rpcUrl: "https://rpc.tanenbaum.io",
    blockExplorerUrl: "https://explorer.tanenbaum.io",
}

export const RolluxChain: Chain = {
    chainId: 57000,
    chainName: "Rollux Zk Testnet",
    isLocalChain: false,
    isTestChain: true,
    nativeCurrency: {
        name: "tSyscoin",
        symbol: "TSYS",
        decimals: 18,
    },
    multicallAddress: '0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697',
    multicall2Address: '0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697',
    getExplorerAddressLink: (address: string) => {
        return address;
    },
    getExplorerTransactionLink: (address: string) => {
        return address;
    },
    rpcUrl: "https://rpc0-test.rollux.com/",
    blockExplorerUrl: "https://rollux.tanenbaum.io",
}

export const networks: { [key: string]: Chain } = {
    [RolluxChainMainnet.chainId]: RolluxChainMainnet,
    [NEVMChain.chainId]: NEVMChain,
    [TanenbaumChain.chainId]: TanenbaumChain,
    [RolluxChain.chainId]: RolluxChain,
}