import {
    Card,
    CardBody,
    ChakraProvider,
    Flex, Heading,
    Highlight, Spinner, Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import { chakraTheme } from 'components/chakraTheme';
import { useConnectedWallet } from "@contexts/ConnectedWallet/useConnectedWallet";
import { useMetamask } from "@contexts/Metamask/Provider";
import { CrossChainMessenger, MessageStatus } from "@eth-optimism/sdk";
import { useEthers, useLogs, useSigner } from "@usedapp/core";
import { RolluxChain, TanenbaumChain } from "blockchain/NevmRolluxBridge/config/chainsUseDapp";
import contractsDev from 'blockchain/NevmRolluxBridge/config/contracts';
import { getNetworkByChainId, getNetworkByName, NetworkData, networks, networksMap } from "blockchain/NevmRolluxBridge/config/networks";
import { crossChainMessengerFactory } from "blockchain/NevmRolluxBridge/factories/CrossChainMessengerFactory";
import { ConnectionWarning } from 'components/ConnectionWarning';
import { BigNumber, Contract, ethers } from "ethers";
import { RolluxHeader } from 'components/RolluxHeader';
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import DepositPart from './_deposit';
import WithdrawPart from './_withdraw';
import L2StandardBridgeABI from "blockchain/NevmRolluxBridge/abi/L2StandardBridge"
import UnfinishedWithdrawalItem from 'components/BridgeL1L2/WIthdraw/UnfinishedWithdrawalItem';
import ViewWithdrawalModal from 'components/BridgeL1L2/WIthdraw/ViewWithdrawalModal';
import ProveMessageStep from 'components/BridgeL1L2/WIthdraw/Steps/ProveMessageStep';
import { useLocalStorage } from 'usehooks-ts';
import RelayMessageStep from 'components/BridgeL1L2/WIthdraw/Steps/RelayMessageStep';
import { PendingMessage } from 'components/BridgeL1L2/WIthdraw/Steps/PendingMessage';

type BridgeNevmRolluxProps = {}

enum CurrentDisplayView {
    deposit,
    withdraw
}


export const BridgeNevmRollux: NextPage<BridgeNevmRolluxProps> = ({ }) => {
    const router = useRouter();
    const [currentDisplay, setCurrentDisplay] = useState<CurrentDisplayView>(CurrentDisplayView.deposit);
    const metamask = useMetamask();
    const connectedWalletCtxt = useConnectedWallet();
    const isConnected = connectedWalletCtxt.nevm.account;
    const { account, activateBrowserWallet, library, switchNetwork, chainId } = useEthers();
    const [crossChainMessenger, setCrossChainMessenger] = useState<CrossChainMessenger | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [unfinishedWithdrawals, setUnfinishedWithdrawals] = useState<{ status: MessageStatus, txHash: string }[]>([])

    const { isOpen: withdrawIsOpen, onOpen: withdrawOnOpen, onClose: widthdrawOnClose } = useDisclosure();
    const toast = useToast();
    const [withdrawalModalData, setWithdrawalModalData] = useState<{ status: MessageStatus, txHash: string }>({ status: 0, txHash: '' });
    const signer = useSigner();
    // [{withdrawTx, proveTx}]
    const [proveTxns, setProveTxns] = useLocalStorage<{ withdrawTx: string, proveTx: string }[]>('prove-txns', []);
    const [relayTxns, setRelayTxns] = useLocalStorage<{ withdrawTx: string, relayTx: string }[]>('relay-txns', []);


    // todo refactor this 2 similar functions
    const getProveTxn = (withdrawTxHash: string, data: { withdrawTx: string, proveTx: string }[]): string | null => {
        try {

            const target = data.find(item => item.withdrawTx === withdrawTxHash);

            if (target) {
                return target.proveTx ?? null;
            }
        } catch {
            return null;
        }

        return null;
    }

    const getRelayTxn = (withdrawTxHash: string, data: { withdrawTx: string, relayTx: string }[]): string | null => {
        try {

            const target = data.find(item => item.withdrawTx === withdrawTxHash);

            if (target) {
                return target.relayTx ?? null;
            }
        } catch {
            return null;
        }

        return null;
    }


    const getCrossChainMessenger = async (signer: ethers.providers.JsonRpcSigner | undefined, currentDisplay: CurrentDisplayView) => {
        if (!signer) {
            console.warn("No Signer")
            return undefined;
        }

        const currentChainId: number = await signer.getChainId();

        console.log(currentChainId);

        const network: NetworkData | undefined = getNetworkByChainId(currentChainId, networks);

        if (!network) {
            console.warn("Can not detect network")
            return undefined;
        }

        const netMap = networksMap[network.name] ?? undefined;
        console.log(network.name);

        if (!netMap) {
            console.warn("Cant not find net mapping")

            return undefined;
        }

        const secondNetwork: NetworkData | undefined = getNetworkByName(netMap, networks);

        if (!secondNetwork) {
            console.warn("Failed to fetch second network by name");
            return undefined;
        }

        console.log(network, secondNetwork);

        const l1Contracts = network.layer === 1 ? network : secondNetwork;
        const l2Contracts = secondNetwork.layer === 2 ? secondNetwork : network;


        if (currentDisplay === CurrentDisplayView.deposit) {

            return crossChainMessengerFactory(
                l1Contracts,
                l2Contracts,
                signer,
                new ethers.providers.JsonRpcProvider(secondNetwork?.rpcAddress),
                true
            )

        }

        // withdraw

        return crossChainMessengerFactory(
            l1Contracts,
            l2Contracts,
            new ethers.providers.JsonRpcProvider(TanenbaumChain.rpcUrl),
            signer,
            true
        )


    };

    const handleERC20Approval = async (l1Token: string, l2Token: string, amount: BigNumber) => {
        if (!library) {
            console.warn("approval:no-library")
            return; // not connected wallet
        }

        if (!crossChainMessenger) {
            console.warn("approval:no-messenger")
            return; // no messenger initialized
        }

        try {

            toast({
                title: 'Approve ERC20.',
                description: "Initialising approval transaction",
                status: 'info',
                duration: 9000,
                isClosable: true,
            })

            await crossChainMessenger.approveERC20(l1Token, l2Token, amount);

            toast({
                title: 'Approve ERC20.',
                description: "Approval transaction sent.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })

            setIsLoading(false);
        } catch (e) {
            console.log(e);
            toast({
                title: 'Approve ERC20 error.',
                description: "Approval transaction error.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            setIsLoading(false);
        }
    }

    const handleERC20Deposit = async (l1Token: string, l2Token: string, amount: BigNumber) => {
        if (!library || !crossChainMessenger) {
            toast({
                title: 'Error.',
                description: "Wallet not connected.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return; // not connected or not initialized
        }

        try {
            toast({
                title: 'Deposit.',
                description: "Initialising deposit transaction",
                status: 'info',
                duration: 9000,
                isClosable: true,
            })
            const tx = await crossChainMessenger.depositERC20(l1Token, l2Token, amount);

            toast({
                title: 'Deposit confirmation.',
                description: "Waiting for deposit confirmation",
                status: 'info',
                isClosable: false,
            })

            await tx.wait();
            await crossChainMessenger.waitForMessageStatus(tx.hash,
                MessageStatus.RELAYED)

            toast({
                title: 'Deposit confirmed.',
                description: "Your deposit was confirmed",
                status: 'success',
                isClosable: false,
            })

            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.log(e);
        }

        // if success

    }

    const updateWithdrawalLogs = async () => {
        widthdrawalsLogs().then(results => {
            if (results) {
                setUnfinishedWithdrawals(results.filter((value) => {
                    return value.status !== MessageStatus.RELAYED;
                }))
            }
        })
    }

    const handleWithdrawMainCurrency = async (amount: string) => {
        if (!library || !crossChainMessenger) {
            console.log('no lib or messenger')
            toast({
                title: 'Error.',
                description: "Wallet not connected.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return;
        }

        try {

            toast({
                title: 'Withdraw.',
                description: "Initialising withdrawal transaction",
                status: 'info',
                duration: 9000,
                isClosable: true,
            })
            const withdrawTx = await crossChainMessenger.withdrawETH(
                ethers.utils.parseEther(amount)
            );

            toast({
                title: 'Withdraw.',
                description: "Withdraw tx sent.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })

            await withdrawTx.wait();

            await updateWithdrawalLogs();

        } catch (e) {
            console.log(`Withdraw SYS failed. Error - ${e}`)

            toast({
                title: 'Withdraw.',
                description: "Error.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        }
    }

    const handleDepositMainCurrency = async (amount: string) => {
        if (!library) {
            toast({
                title: 'Error.',
                description: "Wallet not connected.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return;
        }

        if (crossChainMessenger) {
            try {

                setIsLoading(true);

                toast({
                    title: 'Deposit.',
                    description: "Initialising deposit transaction",
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                })

                const depositTx = await crossChainMessenger.depositETH(
                    ethers.utils.parseEther(amount)
                );

                const _confirmationToast = toast({
                    title: 'Deposit confirmation.',
                    description: "Waiting for deposit confirmation",
                    status: 'info',
                    isClosable: false,
                })

                const confirmation = await crossChainMessenger.waitForMessageReceipt(depositTx);


                toast.close(_confirmationToast);
                if (confirmation.receiptStatus === 1) {



                    toast({
                        title: 'Deposit success.',
                        description: "Your deposit confirmed",
                        status: 'success',
                        duration: 9000,
                        isClosable: true,
                    })

                    setIsLoading(false);
                } else {

                    toast({
                        title: 'Deposit error.',
                        description: "Deposit failed.",
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                    })

                    console.log('Deposit error');
                    console.log(confirmation);
                    setIsLoading(false);
                }
            } catch (e) {
                setIsLoading(false);
                toast({
                    title: 'Deposit error.',
                    description: "Deposit failed.",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
                console.log(e);
            }

        }

    }


    const handleWithdrawERC20Token = async (l1Token: string, l2Token: string, amount: BigNumber) => {
        if (!library || !crossChainMessenger) {
            toast({
                title: 'Error.',
                description: "Wallet not connected.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return false;
        }

        try {
            setIsLoading(true);

            console.log(l1Token, l2Token);

            toast({
                title: 'Withdraw.',
                description: "Initialising withdrawal transaction",
                status: 'info',
                duration: 9000,
                isClosable: true,
            })


            const withDrawERC20Tx = await crossChainMessenger.withdrawERC20(
                l1Token, l2Token, amount
            );

            await withDrawERC20Tx.wait();

            toast({
                title: 'Withdraw.',
                description: "Withdraw tx sent.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })

            await updateWithdrawalLogs();

        } catch (e) {
            console.log(`Error when withdrawing ERC20 - ${e}`);

            toast({
                title: 'Withdraw.',
                description: "Error.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })

            setIsLoading(false);
        }
    }

    /**
     * 
     * Hack for use useDapp
     * 
     * todo : refactor whole app to useDapp instead of web3-react
     */
    useEffect(() => {
        if (!account && connectedWalletCtxt.nevm.account) {
            activateBrowserWallet()
        }
    }, [account, activateBrowserWallet, connectedWalletCtxt.nevm.account]);

    useEffect(() => {
        getCrossChainMessenger(signer, currentDisplay).then((messenger) => {
            console.log(messenger);
            setCrossChainMessenger(messenger);
        })
    }, [signer, currentDisplay])




    const widthdrawalsLogs = useCallback(async () => {
        if (currentDisplay === CurrentDisplayView.withdraw && account) {
            // check for withdrawals

            const L2BridgeContract = new Contract(
                contractsDev.l2_dev.L2StandardBridge,
                new ethers.utils.Interface(L2StandardBridgeABI),
                new ethers.providers.StaticJsonRpcProvider(RolluxChain.rpcUrl)
            )

            const filter = L2BridgeContract.filters['WithdrawalInitiated'](null, null, account)

            const events = await L2BridgeContract.queryFilter(filter);

            if (events.length > 0) {
                const messengerL1 = crossChainMessengerFactory(
                    networks.L1Dev,
                    networks.L2Dev,
                    new ethers.providers.StaticJsonRpcProvider(TanenbaumChain.rpcUrl),
                    new ethers.providers.JsonRpcProvider(RolluxChain.rpcUrl),
                    true
                );

                const checks = await Promise.all(events.map(async (value) => {
                    const status = await messengerL1.getMessageStatus(value.transactionHash)

                    return { status: status, txHash: value.transactionHash };
                }))
                return checks;
            }

            return [];


        }
    }, [currentDisplay, account])

    useEffect(() => {
        const loadWithdrawalLogs = () => {
            widthdrawalsLogs().then(results => {
                if (results) {
                    setUnfinishedWithdrawals(results.filter((value) => {
                        return value.status !== MessageStatus.RELAYED;
                    }))
                }
            })
        }

        loadWithdrawalLogs();
        // const intervalId = setInterval(loadWithdrawalLogs, 10000)
        // return () => clearInterval(intervalId)
    }, [widthdrawalsLogs])



    return (

        <ChakraProvider theme={chakraTheme}>
            <Head>
                <title>Syscoin Bridge | Rollux & NEVM </title>
                <link rel="shortcut icon" href="/favicon.ico" />
                <meta name="description" content="Syscoin Trustless Bridge" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <RolluxHeader />

            <VStack spacing={{ base: '-20', xl: '0' }} pb="50px">
                <Flex
                    id="bg"
                    boxSize={{ base: undefined, xl: '100%' }}
                    overflow="visible"
                    position={{ base: 'initial', xl: 'absolute' }}
                    bg="#28282F"
                    top="0"
                    p={{ base: '16px', xl: '100px' }}
                    clipPath={{
                        base: undefined,
                        xl: 'polygon(0% -15%, 100% 120%, 100% 100%, 0% 100%)',
                    }}
                    pb={{ base: '103px', xl: '100px' }}
                    zIndex={-1}
                    w="100%"
                >
                    <Heading
                        color="white"
                        fontSize={{ base: '33px', xl: '5xl' }}
                        maxW={{ base: '300px', md: '400px' }}
                        lineHeight="135.69%"
                        position={{ base: 'initial', xl: 'absolute' }}
                        top="50%"
                        right="65%"
                        w="100%"
                        transform={{ base: undefined, xl: 'translateY(-50%)' }}
                        m="0 auto"
                    >
                        <Highlight
                            query={['L1 NEVM', 'L2 Rollux']}
                            styles={{ bg: 'brand.primary', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                        >
                            Bridge your $ SYS between L1 NEVM and L2 Rollux
                        </Highlight>
                    </Heading>
                </Flex>

                <Flex
                    as="main"
                    position={{ base: 'initial', xl: 'absolute' }}
                    top="50%"
                    left="60%"
                    transform={{ base: undefined, xl: 'translate(-50%, -50%)' }}
                    p={{ base: '16px' }}
                    mt={{ base: '9', xl: 0 }}
                    flexDir="column"
                    maxW="483px"
                    w={{ base: '100%', md: '483px' }}
                    gap="21px"
                >
                    <Flex
                        px={{ base: '16px', md: '40px' }}
                        py={{ base: '16px', md: '32px' }}
                        flex={1}
                        bg="white"
                        boxShadow={`7px 7px ${chakraTheme.colors.brand.primary}`}
                        borderRadius="12px"
                        border={`1px solid ${chakraTheme.colors.brand.primary}`}
                        justifyContent="center"
                        flexDir="column"
                        m="0 auto"
                    >
                        <Tabs variant="soft-rounded" w="100%" onChange={(index) => setCurrentDisplay(index === 0 ? CurrentDisplayView.deposit : CurrentDisplayView.withdraw)}>
                            <TabList justifyContent="center" bg="#f4fadb" w="max-content" m="0 auto" borderRadius="6px">
                                <Tab
                                    borderRadius="6px"
                                    px="36px"
                                    _selected={{
                                        color: '#000',
                                        bg: 'brand.secondaryGradient',
                                    }}
                                >
                                    Deposit
                                </Tab>
                                <Tab
                                    px="36px"
                                    borderRadius="6px"
                                    _selected={{
                                        color: '#000',
                                        bg: 'brand.secondaryGradient',
                                    }}
                                >
                                    Withdraw
                                </Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel p={{ base: '32px 0 0 0', md: '43px 0 0 0' }}>


                                    <DepositPart
                                        onClickDepositButton={(amount: string) => {
                                            handleDepositMainCurrency(amount);
                                        }}
                                        onClickApproveERC20={(l1Token: string, l2Token: string, amount: BigNumber) => {
                                            handleERC20Approval(l1Token, l2Token, amount);
                                        }}

                                        onClickDepositERC20={(l1Token: string, l2Token: string, amount: BigNumber) => {

                                            console.log(l1Token, l2Token, amount);
                                            handleERC20Deposit(l1Token, l2Token, amount);
                                        }}

                                        setIsLoading={setIsLoading}

                                        L1StandardBridgeAddress="0x39CadECd381928F1330D1B2c13c8CAC358Dce65A"
                                    />

                                </TabPanel>

                                <TabPanel p={{ base: '32px 0 0 0', md: '43px 0 0 0' }}>


                                    {unfinishedWithdrawals.length > 0 && <>

                                        {withdrawalModalData.txHash !== '' && <>
                                            <ViewWithdrawalModal isOpen={withdrawIsOpen} onClose={widthdrawOnClose}
                                                status={withdrawalModalData.status}
                                                txnHash={withdrawalModalData.txHash}
                                            >
                                                {[MessageStatus.IN_CHALLENGE_PERIOD, MessageStatus.STATE_ROOT_NOT_PUBLISHED, MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE].includes(withdrawalModalData.status) && <>
                                                    <PendingMessage status={withdrawalModalData.status} waitTime={0} />
                                                </>}


                                                {withdrawalModalData.status === MessageStatus.READY_TO_PROVE && <>
                                                    <ProveMessageStep
                                                        chainId={chainId || 1}
                                                        proveTxHash={getProveTxn(withdrawalModalData.txHash, proveTxns) ?? ''}
                                                        requiredChainId={TanenbaumChain.chainId}
                                                        onClickProveMessage={async () => {
                                                            if (!signer) {
                                                                return;
                                                            }

                                                            const messengerL1 = crossChainMessengerFactory(
                                                                networks.L1Dev,
                                                                networks.L2Dev,
                                                                signer,
                                                                new ethers.providers.JsonRpcProvider(RolluxChain.rpcUrl),
                                                                true
                                                            );
                                                            const _tx = await (new ethers.providers.JsonRpcProvider(RolluxChain.rpcUrl)).getTransaction(withdrawalModalData.txHash);

                                                            const proveTx = await messengerL1.proveMessage(_tx);

                                                            const tmpProven = [...proveTxns]
                                                            tmpProven.push({ withdrawTx: withdrawalModalData.txHash, proveTx: proveTx.hash });

                                                            setProveTxns([...tmpProven]);
                                                        }}
                                                        onClickSwitchNetwork={async () => {
                                                            await switchNetwork(TanenbaumChain.chainId)
                                                        }}
                                                    />
                                                </>}

                                                {withdrawalModalData.status === MessageStatus.READY_FOR_RELAY && <>
                                                    <RelayMessageStep
                                                        chainId={chainId || 1}
                                                        relayTxHash={getRelayTxn(withdrawalModalData.txHash, relayTxns) ?? ''}
                                                        requiredChainId={TanenbaumChain.chainId}
                                                        onClickRelayMessage={async () => {
                                                            if (!signer) {
                                                                return;
                                                            }

                                                            const messengerL1 = crossChainMessengerFactory(
                                                                networks.L1Dev,
                                                                networks.L2Dev,
                                                                signer,
                                                                new ethers.providers.JsonRpcProvider(RolluxChain.rpcUrl),
                                                                true
                                                            );

                                                            const relayTx = await messengerL1.finalizeMessage(withdrawalModalData.txHash);

                                                            const tmpRelayed = [...relayTxns]
                                                            tmpRelayed.push({ withdrawTx: withdrawalModalData.txHash, relayTx: relayTx.hash });

                                                            setRelayTxns([...tmpRelayed]);
                                                        }}
                                                        onClickSwitchNetwork={async () => {
                                                            await switchNetwork(TanenbaumChain.chainId)
                                                        }}
                                                    />
                                                </>}


                                            </ViewWithdrawalModal>
                                        </>}


                                        <Flex
                                            px={{ base: '8px', md: '20px' }}
                                            py={{ base: '8px', md: '16px' }}
                                            flex={1}
                                            bg="white"
                                            boxShadow={`7px 7px ${chakraTheme.colors.brand.primary}`}
                                            borderRadius="12px"
                                            border={`1px solid ${chakraTheme.colors.brand.primary}`}
                                            justifyContent="center"
                                            flexDir="column"
                                            m="0 0 30px 0"
                                            maxW="380px"
                                            maxH={"400px"}
                                            overflow={"scroll-y"}
                                        >
                                            <Heading size="s" sx={{ marginBottom: 5 }}>
                                                You have unfinished withdrawals
                                            </Heading>
                                            {unfinishedWithdrawals.map((item) => {
                                                return <UnfinishedWithdrawalItem key={item.txHash} status={item.status} txHash={item.txHash}
                                                    onClickView={() => {
                                                        setWithdrawalModalData({
                                                            status: item.status,
                                                            txHash: item.txHash
                                                        })
                                                        console.log({
                                                            status: item.status,
                                                            txHash: item.txHash
                                                        })

                                                        withdrawOnOpen();
                                                    }}
                                                />
                                            })}
                                        </Flex>

                                    </>}



                                    <WithdrawPart
                                        onClickWithdrawButton={(amount) => {
                                            handleWithdrawMainCurrency(amount);
                                        }}
                                        onClickWithdrawERC20={(_l1Token, _l2Token, amount) => {
                                            handleWithdrawERC20Token(_l1Token, _l2Token, amount);
                                        }}
                                        setIsLoading={setIsLoading}
                                        L1StandardBridgeAddress="0x77Cdc3891C91729dc9fdea7000ef78ea331cb34A"
                                    />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Flex>

                    {!isConnected && <ConnectionWarning />}
                </Flex>
            </VStack>

        </ChakraProvider>
    )
}

export default BridgeNevmRollux;