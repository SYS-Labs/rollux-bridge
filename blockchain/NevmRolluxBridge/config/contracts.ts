import { ethers } from "ethers"

const contractsDev = {
    l1: {
        AddressManager: '0x8757cD6052fef862681e992F58fCdd71580b99d5',
        L1CrossDomainMessenger: '0x0E8aaa986C6eACc401680DC24727AC33d955DcBc',
        L1StandardBridge: '0x9cc66f9B7b07F72a487FF751a7cBE281976fce7C',
        StateCommitmentChain: ethers.constants.AddressZero,
        CanonicalTransactionChain: ethers.constants.AddressZero,
        BondManager: ethers.constants.AddressZero,
        OptimismPortal: '0xfE43B2C8A481c412481BC5A36261380eDc417266',
        L2OutputOracle: '0xb8FFE6015e1c00CFA620F884f25f21f001744C0e',
        L1ERC721Bridge: '0x336F509Cd9dECcfBc4ef38F329dA8D5930F142b8',
    },
    l2: {
        L2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
        DeployerWhitelist: '0x4200000000000000000000000000000000000002',
        L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
        GasPriceOracle: '0x420000000000000000000000000000000000000F',
        L2StandardBridge: '0x4200000000000000000000000000000000000010',
        SequencerFeeVault: '0x4200000000000000000000000000000000000011',
        OptimismMintableERC20Factory: '0x4200000000000000000000000000000000000012',
        L1BlockNumber: '0x4200000000000000000000000000000000000013',
        L1Block: '0x4200000000000000000000000000000000000015',
        LegacyERC20ETH: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        WETH9: '0x4200000000000000000000000000000000000006',
        GovernanceToken: '0x4200000000000000000000000000000000000042',
        LegacyMessagePasser: '0x4200000000000000000000000000000000000000',
        L2ERC721Bridge: '0x4200000000000000000000000000000000000014',
        OptimismMintableERC721Factory: '0x4200000000000000000000000000000000000017',
        ProxyAdmin: '0x4200000000000000000000000000000000000018',
        BaseFeeVault: '0x4200000000000000000000000000000000000019',
        L1FeeVault: '0x420000000000000000000000000000000000001a',
    },
    l1_dev: {
        AddressManager: '0xf2ad472ade2009Ef5eeb26B7fe27BA9fd27dE46A',
        L1CrossDomainMessenger: '0x2C3026b9845264011FdF709Af0e8df0E6ec09F38',
        L1StandardBridge: '0x39CadECd381928F1330D1B2c13c8CAC358Dce65A',
        StateCommitmentChain: ethers.constants.AddressZero,
        CanonicalTransactionChain: ethers.constants.AddressZero,
        BondManager: ethers.constants.AddressZero,
        OptimismPortal: '0x61200B9fcBB421aFD0Bb5A732fe48ec98482E39C',
        L2OutputOracle: '0x63D297aa3feCbf6eEdE0aCd15B0308B9C8379afb',
        L1ERC721Bridge: '0x5eE6E08Cb652775f6B48CA8357a1d240b50018Aa',
    },
    l2_dev: {
        L2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
        DeployerWhitelist: '0x4200000000000000000000000000000000000002',
        L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
        GasPriceOracle: '0x420000000000000000000000000000000000000F',
        L2StandardBridge: '0x4200000000000000000000000000000000000010',
        SequencerFeeVault: '0x4200000000000000000000000000000000000011',
        OptimismMintableERC20Factory: '0x4200000000000000000000000000000000000012',
        L1BlockNumber: '0x4200000000000000000000000000000000000013',
        L1Block: '0x4200000000000000000000000000000000000015',
        LegacyERC20ETH: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        WETH9: '0x4200000000000000000000000000000000000006',
        GovernanceToken: '0x4200000000000000000000000000000000000042',
        LegacyMessagePasser: '0x4200000000000000000000000000000000000000',
        L2ERC721Bridge: '0x4200000000000000000000000000000000000014',
        OptimismMintableERC721Factory: '0x4200000000000000000000000000000000000017',
        ProxyAdmin: '0x4200000000000000000000000000000000000018',
        BaseFeeVault: '0x4200000000000000000000000000000000000019',
        L1FeeVault: '0x420000000000000000000000000000000000001a',
    },
    l1_nebula: {
        AddressManager: '0x905f0452Ae00cd5b75c87904d957fa1856Dd6447',
        L1CrossDomainMessenger: '0xa1dedcCBe59888b9468B15fC0454C94818189a30',
        L1StandardBridge: '0xe80D537Df797fa21C11df1324ce30f8e522Ed851',
        StateCommitmentChain: ethers.constants.AddressZero,
        CanonicalTransactionChain: ethers.constants.AddressZero,
        BondManager: ethers.constants.AddressZero,
        OptimismPortal: '0x97ae440695C4E80aF90e4B153469B268e3C3988a',
        L2OutputOracle: '0xD07716f322739C15fF068AE8D78c32A23E666c6a',
        L1ERC721Bridge: '0x352B2f0A99d6086Cca0EEfFfEa94753C77fDDD33',
    },
    l2_nebula: {
        L2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
        DeployerWhitelist: '0x4200000000000000000000000000000000000002',
        L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
        GasPriceOracle: '0x420000000000000000000000000000000000000F',
        L2StandardBridge: '0x4200000000000000000000000000000000000010',
        SequencerFeeVault: '0x4200000000000000000000000000000000000011',
        OptimismMintableERC20Factory: '0x4200000000000000000000000000000000000012',
        L1BlockNumber: '0x4200000000000000000000000000000000000013',
        L1Block: '0x4200000000000000000000000000000000000015',
        LegacyERC20ETH: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        WETH9: '0x4200000000000000000000000000000000000006',
        GovernanceToken: '0x4200000000000000000000000000000000000042',
        LegacyMessagePasser: '0x4200000000000000000000000000000000000000',
        L2ERC721Bridge: '0x4200000000000000000000000000000000000014',
        OptimismMintableERC721Factory: '0x4200000000000000000000000000000000000017',
        ProxyAdmin: '0x4200000000000000000000000000000000000018',
        BaseFeeVault: '0x4200000000000000000000000000000000000019',
        L1FeeVault: '0x420000000000000000000000000000000000001a',
    }
}



export default contractsDev;