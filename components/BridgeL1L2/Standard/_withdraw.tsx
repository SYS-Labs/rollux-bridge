import { ArrowRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
    Box,
    Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, HStack, Image, Input, Menu,
    MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, PlacementWithLogical, Spacer, Text, useBreakpointValue, Wrap
} from '@chakra-ui/react';
import { ERC20Interface, useEtherBalance, useEthers, useTokenAllowance, useTokenBalance } from '@usedapp/core';
import { fetchERC20TokenList } from 'blockchain/NevmRolluxBridge/fetchers/ERC20TokenList';
import TokenListToken from 'blockchain/NevmRolluxBridge/interfaces/TokenListToken';
import { ConnectButton } from 'components/ConnectButton';
import { OtherProvidersMenuSelector } from 'components/BridgeL1L2/OtherProviders/OtherProvidersMenuSelector';
import { BigNumber, ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import React, { FC, useEffect, useState } from 'react';
import { useSelectedNetwork } from 'hooks/rolluxBridge/useSelectedNetwork';
import WarningInfoBlock from 'components/Common/WarningInfoBlock';
import { DirectionSwitcherArrow } from '../DirectionSwitcherArrow';
import SelectTokenModal from './SelectTokenModal';
import { RolluxLogo } from 'components/Icons/RolluxLogo';
import { MaxBalance } from '../MaxBalance';
import { ReviewWithdrawal } from '../Withdraw/ReviewWithdrawal';
import { useEstimateTransaction } from 'hooks/rolluxBridge/useEstimateTransaction';
import { useCrossChainMessenger } from 'hooks/rolluxBridge/useCrossChainMessenger';
import { useAppDispatch, useAppSelector } from 'store';
import { shallowEqual } from 'react-redux';
import { setAmountToSwap as setAmountToSwapStore } from 'store/slices/Withdrawals';

export type WithdrawPartProps = {
    onClickWithdrawButton: (amount: string) => void;
    onClickWithdrawERC20: (l1Token: string, l2Token: string, amount: BigNumber) => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    onSelectBridgeProvider: (provider: string, force: boolean) => void;
    onSwapDirection: () => void;
}

type EstimatedPrice = {
    initGasPrice: number | undefined,
    initUsdPrice: number | undefined,
    proveGasPrice: number | undefined,
    proveUsdPrice: number | undefined,
    finalizeGasPrice: number | undefined,
    finalizeUsdPrice: number | undefined,
    estimatedForAmount: number,
}

export const WithdrawPart: FC<WithdrawPartProps> = ({ onClickWithdrawButton, onClickWithdrawERC20, setIsLoading, onSelectBridgeProvider, onSwapDirection }) => {
    const [currency, setCurrency] = useState<string>('SYS');
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | undefined>(undefined);
    const [selectedTokenAddressL2, setSelectedTokenAddressL2] = useState<string | undefined>(undefined);
    const [balanceToDisplay, setBalanceToDisplay] = useState<string>('');
    const [selectedTokenDecimals, setSelectedTokenDecimals] = useState<number>(18);

    const appDispatch = useAppDispatch();

    const amountToSwap = useAppSelector(state => state.rootReducer.Withdrawals.amountToSwap, shallowEqual);

    const setAmountToSwap = (amount: string) => {
        appDispatch(setAmountToSwapStore(amount));
    }

    // const [amountToSwap, setAmountToSwap] = useState<string>('');
    const { account, chainId, switchNetwork } = useEthers();
    const { l1ChainId, l2ChainId, rpcL1, rpcL2, selectedNetwork } = useSelectedNetwork();

    const balanceNativeToken = useEtherBalance(account, { chainId: l2ChainId });
    const balanceERC20Token = useTokenBalance(selectedTokenAddress, account, { chainId: l2ChainId });
    const [allERC20Tokens, setAllERC20Tokens] = useState<TokenListToken[]>([]);
    const [l1ERC20Tokens, setL1ERC20Tokens] = useState<TokenListToken[]>([]);
    const [l2ERC20Tokens, setL2ERC20Tokens] = useState<TokenListToken[]>([]);
    const selectedToken = currency !== 'SYS' ?
        l2ERC20Tokens?.find(token => token.symbol === currency) :
        { address: '', chainId: l2ChainId, decimals: 18, name: 'Syscoin', symbol: 'SYS', logoURI: '/syscoin-logo.svg' }

    const balanceNativeTokenL1 = useEtherBalance(account, { chainId: l1ChainId });
    const balanceERC20TokenL1 = useTokenBalance(selectedToken?.address || ethers.constants.AddressZero, account, { chainId: l1ChainId });

    const handleSwitchNetwork = async (_toSwitch: number) => {
        await switchNetwork(_toSwitch);
    }

    const messenger = useCrossChainMessenger();

    const [estimatedTxPrice, setEstimatedTxPrice] = useState<EstimatedPrice>({
        initGasPrice: undefined,
        initUsdPrice: undefined,
        proveGasPrice: undefined,
        proveUsdPrice: undefined,
        finalizeGasPrice: undefined,
        finalizeUsdPrice: undefined,
        estimatedForAmount: 0,
    });

    const { calculateEstimate } = useEstimateTransaction();

    const [outputNetwork, setOutputNetwork] = useState<string>('SYS');

    // balance hook

    const preCheckNetwork = async (neededNetwork: number, chainId: number) => {
        if (chainId !== neededNetwork) {
            return switchNetwork(neededNetwork);
        }
    }


    useEffect(() => {

        if (currency === 'SYS') {
            // native
            if (balanceNativeToken) {
                setBalanceToDisplay(
                    ethers.utils.formatEther(balanceNativeToken)
                )
            }
        } else {
            try {

                if (balanceERC20Token) {
                    setBalanceToDisplay(
                        ethers.utils.formatUnits(balanceERC20Token, selectedTokenDecimals)
                    )
                } else {
                    setBalanceToDisplay('0.00');
                }
            } catch (e) {
                console.warn("Failed to load token balance");
                console.warn(e);

                setBalanceToDisplay('0.00');
            }
        }
    }, [balanceNativeToken, balanceERC20Token, currency, selectedTokenDecimals, account]);

    // currency hook
    useEffect(() => {
        if ('SYS' === currency) {
            return;
        }


        let findToken: TokenListToken | undefined = undefined;
        let findTokenL2: TokenListToken | undefined = undefined;

        l2ERC20Tokens.forEach((value) => {
            if (value.symbol === currency) {
                findToken = value;
            }
        })

        if (findToken) {
            // console.log(findToken);
            // @ts-ignore
            setSelectedTokenAddress(findToken.address);
            // @ts-ignore
            setSelectedTokenDecimals(findToken.decimals);

            l1ERC20Tokens.forEach((value) => {
                if (value.symbol === currency && typeof findTokenL2 === 'undefined') {
                    findTokenL2 = value;
                }
            })
            if (findTokenL2) {
                //@ts-ignore
                setSelectedTokenAddressL2(findTokenL2.address);
            }
        }

    }, [currency, l1ERC20Tokens, l2ERC20Tokens]);


    /** load tokens hook */
    useEffect(() => {
        setIsLoading(true);

        fetchERC20TokenList().then((tokens) => {
            const tokensL1: TokenListToken[] = tokens.filter((token) => {
                if (token.chainId === l1ChainId) {
                    return true;
                }

                return false;
            })

            setL1ERC20Tokens(tokensL1);


            const tokensL2: TokenListToken[] = tokens.filter((token) => {
                if (token.chainId === l2ChainId) {
                    return true;
                }

                return false;
            })

            setL2ERC20Tokens(tokensL2);

            setAllERC20Tokens(tokens);

            setIsLoading(false);
        })
    }, [setIsLoading, l1ChainId, l2ChainId]);


    const handleERC20Withdraw = async () => {
        if (selectedTokenAddress && selectedTokenAddressL2) {

            await preCheckNetwork(l2ChainId, chainId as number);

            setIsLoading(true);
            onClickWithdrawERC20(selectedTokenAddressL2, selectedTokenAddress, ethers.utils.parseUnits(amountToSwap, selectedTokenDecimals));
        }
    }


    return (
        <Flex flexDir="column" pb={4} pr={1} pl={1}>

            <Box sx={{
                backgroundColor: 'brand.lightPrimary',
                borderRadius: '4px',
                p: 3
            }}>
                <FormControl isInvalid={false}>
                    <Flex justifyContent="space-between">

                        <HStack mb={0} color={'gray.500'}>
                            <Text>From</Text>
                            <RolluxLogo width={20} height={20} />
                            <Text> Rollux</Text>
                            <Spacer />
                        </HStack>


                        <Spacer />

                    </Flex>

                    <HStack borderRadius="6px" mt={1} minH="48px" pr={'0px'} >
                        <NumberInput sx={{
                            border: '1px solid',
                            borderColor: parseFloat(balanceToDisplay) < parseFloat(amountToSwap) ? 'red.300' : 'gray.300',
                            borderRadius: '6px',
                            _hover: {
                                borderColor: parseFloat(balanceToDisplay) < parseFloat(amountToSwap) ? 'red.400' : 'gray.400'
                            },
                        }} w={'100%'} value={(amountToSwap.length > 0) ? amountToSwap : ''} variant="secondary" size="md" onChange={(valueAsString) => {

                            const value = valueAsString.replaceAll('..', '.');

                            if (!isNaN(parseFloat(value))) {
                                setAmountToSwap(value);
                            } else {
                                setAmountToSwap('');
                            }

                        }}>
                            <HStack gap={0}>
                                <NumberInputField placeholder='0.00' />

                                <SelectTokenModal
                                    tokens={l2ERC20Tokens}
                                    onSelect={(token) => {
                                        setCurrency(token.symbol);
                                        setAmountToSwap('');
                                    }}
                                    chainId={l2ChainId}
                                    selectedToken={selectedToken !== undefined ? selectedToken : { address: '', chainId: l1ChainId, decimals: 18, name: 'Syscoin', symbol: 'SYS', logoURI: '/syscoin-logo.svg' }}
                                />
                            </HStack>



                        </NumberInput>


                    </HStack>

                    <FormErrorMessage>Invalid amount</FormErrorMessage>
                    <HStack mt={1}>
                        {
                            selectedToken && selectedToken?.symbol !== 'SYS' ?
                                <><Text mr={1} color={'gray.500'}>Balance: {parseFloat(ethers.utils.formatUnits(balanceERC20Token || BigNumber.from('0'), selectedTokenDecimals)).toFixed(2) || '0.00'} {selectedToken.symbol}</Text>
                                    <MaxBalance onClick={() => {
                                        setAmountToSwap(balanceToDisplay);
                                    }} />
                                </> : selectedToken ?
                                    <><Text mr={1} color={'gray.500'}>Balance: {balanceNativeToken ? (+formatEther(balanceNativeToken)).toFixed(4) : '0.00'} SYS</Text><MaxBalance onClick={() => {
                                        const maxAmount = balanceNativeToken?.gt(ethers.utils.parseEther("0.005")) ? ethers.utils.formatEther(balanceNativeToken.sub(ethers.utils.parseEther('0.005'))) : '0.00';
                                        setAmountToSwap(maxAmount);

                                    }} /></> : <></>
                        }
                    </HStack>
                </FormControl>
            </Box>
            <DirectionSwitcherArrow onClick={onSwapDirection} />

            {selectedToken && (
                <Flex flexDir="column" maxW="100%" mt={1} backgroundColor={'brand.lightPrimary'} borderRadius={'4px'} p={3}>
                    <HStack mt={0} ml={2}>
                        <OtherProvidersMenuSelector preSelectLabel={'To '} onSelect={(provider) => {
                            setOutputNetwork(provider);
                            onSelectBridgeProvider(provider, false);
                        }} />
                    </HStack>
                    <HStack mt={0} ml={2} color={'gray.500'}>
                        <Text>You will receive: {amountToSwap || '0'} {selectedToken.symbol}</Text>
                    </HStack>
                    {account && <>
                        <HStack mt={0} ml={2} color={'gray.500'}>
                            <Text>Balance:  {parseFloat(ethers.utils.formatUnits(currency === 'SYS' ? (balanceNativeTokenL1 ?? BigNumber.from('0')) : (balanceERC20TokenL1 ?? BigNumber.from("0")),
                                selectedTokenDecimals
                            )).toFixed(4)} {selectedToken.symbol}</Text>
                        </HStack>
                    </>}
                </Flex>
            )}

            <Flex
                mt={3}
                w="100%"
                __css={{
                    button: {
                        w: '100%'
                    }
                }}
            >
                {!account && (
                    <ConnectButton />
                )}


                {((account && chainId !== l2ChainId)) && <>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleSwitchNetwork(
                                [570, 57000].includes(l2ChainId) ? l2ChainId : 570,
                            )
                        }}
                    >
                        {'Switch to Rollux'}
                    </Button>
                </>}

                {/* {('SYS' === currency && account && (chainId !== l2ChainId)) && <>
                    <Button
                        isDisabled={ethers.utils.parseUnits(balanceToDisplay || '0', selectedTokenDecimals).lt(ethers.utils.parseUnits(amountToSwap || '0', selectedTokenDecimals))}
                        variant="primary"
                        onClick={async () => {
                            await switchNetwork(l2ChainId);
                        }}
                    >
                        Switch to Rollux Chain
                    </Button>
                </>} */}

                {(account && (chainId && chainId === l2ChainId)) && <>
                    {/* <Button
                        isDisabled={ethers.utils.parseUnits(balanceToDisplay || '0', selectedTokenDecimals).lt(ethers.utils.parseUnits(amountToSwap || '0', selectedTokenDecimals))}
                        variant="primary"
                        onClick={async () => {
                            await preCheckNetwork(l2ChainId, chainId as number);
                            onClickWithdrawButton(amountToSwap);
                        }}
                    >
                        Withdraw
                    </Button> */}

                    <ReviewWithdrawal
                        amountToWithdraw={amountToSwap}
                        tokenSymbol={currency}
                        totalEstimatedFeeUsd={0.0141}
                        initiateFeeUsd={0.0001}
                        proveFeeUsd={0.004}
                        claimFeeUsd={0.01}
                        onClickWithdrawal={async () => {
                            await preCheckNetwork(l2ChainId, chainId as number);
                            if (!selectedToken || selectedToken.symbol === 'SYS') {
                                onClickWithdrawButton(amountToSwap);
                            } else {
                                onClickWithdrawERC20(
                                    selectedTokenAddressL2 ?? '',
                                    selectedTokenAddress ?? '',
                                    ethers.utils.parseUnits(amountToSwap),
                                );
                            }
                        }}
                        onClickUseThirdPartyBridge={() => {
                            console.log('closed modal just.')
                        }}
                        isDisabled={ethers.utils.parseUnits(balanceToDisplay || '0', selectedTokenDecimals).lt(ethers.utils.parseUnits(amountToSwap || '0', selectedTokenDecimals)) || amountToSwap.length === 0}

                    />
                </>}
            </Flex>
        </Flex >
    )
}

export default WithdrawPart;
