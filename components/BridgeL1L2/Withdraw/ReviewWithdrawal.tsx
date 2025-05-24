import React, { FC, useEffect, useState } from "react"
import {
    Button,
    HStack,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Checkbox,
    useDisclosure,
    ModalHeader,
    Spacer,
    Box,
} from "@chakra-ui/react"

import { ReviewWithdrawalStep } from "./ReviewWithdrawalStep";
import { MdGetApp, MdLockClock, MdOutlineShield, MdSend } from "react-icons/md";

export type ReviewWithdrawalProps = {
    onClickWithdrawal: () => void;
    onClickUseThirdPartyBridge: () => void;
    isDisabled: boolean;
    amountToWithdraw: string;
    tokenSymbol: string;
    totalEstimatedFeeUsd: string | number;
    initiateFeeUsd: string | number;
    proveFeeUsd: string | number;
    claimFeeUsd: string | number;
}


export const ReviewWithdrawal: FC<ReviewWithdrawalProps> = ({
    onClickWithdrawal,
    onClickUseThirdPartyBridge,
    isDisabled,
    amountToWithdraw,
    tokenSymbol,
    totalEstimatedFeeUsd,
    initiateFeeUsd,
    proveFeeUsd,
    claimFeeUsd
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedTimer, setAcceptedTimer] = useState(false)

    useEffect(() => {
        setAcceptedTerms(false)
        setAcceptedTimer(false)
    }, [isOpen]);

    const handleUseThirdPartyBridgeButton = () => {
        onClickUseThirdPartyBridge()
        onClose()
    }

    return (<>
        <Button variant={'secondary'}
            isDisabled={isDisabled}
            onClick={() => {
                onOpen()
            }}>
            Review withdrawal
        </Button>

        <Modal size={'lg'} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>
                    Withdrawal
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <HStack mb={1} mt={1}>
                        <Text color={'gray.400'}>Amount to withdraw</Text>
                    </HStack>
                    <HStack mb={1} mt={1}>
                        <Text fontSize={'md'} fontWeight={'bold'}>{amountToWithdraw} {tokenSymbol}</Text>
                        {/* <Spacer />
                        <Text fontSize={'xl'} color={'gray.400'}>${totalEstimatedFeeUsd}</Text> */}
                    </HStack>

                    <Spacer />

                    <Box>
                        <ReviewWithdrawalStep
                            icon={MdSend}
                            title={'Initiate withdrawal'}
                            gasPrice={initiateFeeUsd}
                            externalLink={null}
                        />

                        <ReviewWithdrawalStep
                            icon={MdLockClock}
                            title={'Wait up to 1 hour'}
                            externalLink={'https://rollux.com'}
                        />

                        <ReviewWithdrawalStep
                            icon={MdOutlineShield}
                            title={'Prove withdrawal'}
                            gasPrice={proveFeeUsd}
                        />

                        <ReviewWithdrawalStep
                            icon={MdSend}
                            title={'Wait 2 hours'}
                        />

                        <ReviewWithdrawalStep
                            icon={MdGetApp}
                            title={'Claim withdrawal'}
                            gasPrice={claimFeeUsd}
                        />
                    </Box>

                    <Spacer />

                    <HStack mt={1} p={2}>
                        <Checkbox
                            size={'md'}
                            isChecked={acceptedTerms}
                            onChange={(e) => {
                                setAcceptedTerms(e.target.checked)
                            }
                            }
                        >
                            I understand it will take ~2 hours until my funds are claimable at Syscoin NEVM.
                        </Checkbox>
                    </HStack>

                    <HStack mt={1} p={2}>
                        <Checkbox
                            size={'md'}
                            isChecked={acceptedTimer}
                            onChange={(e) => {
                                setAcceptedTimer(e.target.checked)
                            }
                            }
                        >
                            I understand the ~2 hours withdrawal timer does not start until I prove my withdrawal.
                        </Checkbox>
                    </HStack>

                    <HStack mt={1} p={2}>
                        <Button variant={'primary'}
                            isDisabled={!acceptedTerms || !acceptedTimer}
                            w={'100%'}
                            onClick={() => {
                                onClickWithdrawal()
                                onClose()
                            }}
                        >
                            Initiate withdrawal
                        </Button>
                    </HStack>
                    <HStack mt={1} p={2}>
                        <Button variant={'outlined'} w={'100%'} onClick={() => {
                            handleUseThirdPartyBridgeButton()
                        }}> Use third party bridge </Button>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>

    </>)
}