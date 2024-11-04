import React, { FC } from "react";
import {
    ModalHeader,
    HStack,
    Divider,
    IconButton,
    Spacer,
    Text,
    ModalBody,
    Button,
    VStack,
    Box,
    Icon,

} from "@chakra-ui/react"

import {
    QuestionIcon,
} from "@chakra-ui/icons"
import CloseButton from "../CloseButton";
import { CoinbaseWalletConnector, useEthers } from "@usedapp/core";
import { TanenbaumChain } from "blockchain/NevmRolluxBridge/config/chainsUseDapp";
import { PaliWalletConnector } from "blockchain/NevmRolluxBridge/walletConnectors/PaliWalletConnector";
import { ConnectWalletButton } from "../Components/ConnectWalletButton";

export type ConnectWalletBlockProps = {
    setScreen: (value: string) => void;
    onClose: () => void;
}

export const ConnectWalletBlock: FC<ConnectWalletBlockProps> = ({ setScreen, onClose }) => {
    const { activateBrowserWallet, activate, deactivate } = useEthers();

    return (<>
        <ModalHeader>
            <HStack spacing={4}>
                <IconButton aria-label="Info" onClick={() => setScreen('help')} icon={<QuestionIcon />} />
                <Spacer />
                <Text textAlign={'center'}>Connect a Wallet</Text>
                <Spacer />
                <CloseButton onClose={onClose} setScreen={setScreen} />
            </HStack>
        </ModalHeader>
        <Divider />
        <ModalBody>
            <VStack spacing={1} justifyContent={'left'}>
                <Box w={'100'} textAlign={'center'}
                    sx={
                        {
                            backgroundColor: 'gray.100',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            padding: '8px',
                        }
                    }
                >
                    <HStack>
                        <Icon as={QuestionIcon} />
                        <Text textAlign={'center'} size='sm' fontSize={'12px'}>
                            {'Before use Pali wallet connector please switch your network mode to EVM chain to prevent app crash.'}
                        </Text>
                    </HStack>

                </Box>
                <ConnectWalletButton
                    label={'Pali Wallet'}
                    logoPath={'/wallets/Pali.svg'}
                    onClick={() => {
                        onClose();
                        activate(new PaliWalletConnector());
                    }}
                />
                <ConnectWalletButton
                    label={'MetaMask'}
                    logoPath={'/wallets/Metamask.svg'}
                    onClick={() => {
                        onClose();
                        try {
                            deactivate();
                        } catch (e) {
                            console.log("Already deactivated");
                            console.log(e);
                        }
                        activateBrowserWallet();
                    }}
                />
                <ConnectWalletButton
                    label={'Rainbow Wallet'}
                    logoPath={'/wallets/Rainbow.svg'}
                    onClick={() => {
                        import("@usedapp/wallet-connect-v2-connector").then(({ WalletConnectV2Connector }) => {

                            onClose();

                            activate(new WalletConnectV2Connector(
                                {
                                    projectId: "6b7e7faf5a9e54e3c5f22289efa5975b", chains: [
                                        TanenbaumChain,
                                    ],
                                    rpcMap: {
                                        [TanenbaumChain.chainId]: TanenbaumChain.rpcUrl as string,
                                    }

                                }
                            ));
                        })
                    }}
                />
                <ConnectWalletButton
                    label={'Coinbase Wallet'}
                    logoPath={'/wallets/Coinbase.svg'}
                    onClick={() => {
                        onClose();
                        activate(new CoinbaseWalletConnector());
                    }}
                />
                <ConnectWalletButton
                    label={'Wallet Connect'}
                    logoPath={'/wallets/WalletConnect.svg'}
                    onClick={() => {
                        import("@usedapp/wallet-connect-v2-connector").then(({ WalletConnectV2Connector }) => {

                            onClose();

                            activate(new WalletConnectV2Connector(
                                {
                                    projectId: "6b7e7faf5a9e54e3c5f22289efa5975b", chains: [
                                        TanenbaumChain,
                                    ],
                                    rpcMap: {
                                        [TanenbaumChain.chainId]: TanenbaumChain.rpcUrl as string,
                                    }

                                }
                            ));
                        }
                        )
                    }}
                />
            </VStack>
            <Divider mt={5} />
            <Text textAlign={'center'}>
                By connecting a wallet to use the Gateway you agree to the Gateway Terms, and to use the Rollux NFT service you agree to the Rollux NFT Terms & Conditions.
            </Text>
        </ModalBody>
    </>);
}

export default ConnectWalletBlock;