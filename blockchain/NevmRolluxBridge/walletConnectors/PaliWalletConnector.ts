import { Connector, ConnectorUpdateData, ConnectorEvent } from '@usedapp/core'
import { providers } from 'ethers'

const GET_PALI_LINK = 'https://paliwallet.com/'

interface MetaMaskEthereumProvider {
    isMetaMask?: boolean;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
}

const isMobile = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent ?? '') : false;

function detectEthereumProvider<T = MetaMaskEthereumProvider>({
    mustBeMetaMask = false,
    silent = false,
    timeout = 3000,
} = {}): Promise<T | null> {

    _validateInputs();

    let handled = false;

    return new Promise((resolve) => {

        // @ts-ignore
        let isReallyPali = String((window as Window).ethereum.wallet ?? '').includes('pali');



        if ((window as Window).ethereum && (window as any).pali && isReallyPali) {

            handleEthereum();

        } else {

            window.addEventListener(
                'ethereum#initialized',
                handleEthereum,
                { once: true },
            );

            setTimeout(() => {
                handleEthereum();
            }, timeout);
        }

        function handleEthereum() {

            if (handled) {
                return;
            }
            handled = true;

            window.removeEventListener('ethereum#initialized', handleEthereum);

            const { ethereum } = window as Window;

            const { pali } = isMobile ? { pali: true } : window as any;
            // @ts-ignore
            let isReallyPali = String(ethereum.wallet ?? '').includes('pali');

            if (ethereum && isReallyPali && (!mustBeMetaMask || ethereum.isMetaMask) && pali) {
                resolve(ethereum as unknown as T);
            } else {

                const message = mustBeMetaMask && ethereum
                    ? 'Non-MetaMask window.ethereum detected.'
                    : 'Unable to detect window.ethereum.';

                !silent && console.error('@metamask/detect-provider:', message);
                resolve(null);
            }
        }
    });

    function _validateInputs() {
        if (typeof mustBeMetaMask !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'mustBeMetaMask' to be a boolean.`);
        }
        if (typeof silent !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'silent' to be a boolean.`);
        }
        if (typeof timeout !== 'number') {
            throw new Error(`@metamask/detect-provider: Expected option 'timeout' to be a number.`);
        }
    }
}

export async function getMetamaskProvider() {

    if (!(window as any).pali && !isMobile) { // going to skip this check for mobile devices. 
        window.open(GET_PALI_LINK)
        return undefined
    }


    if ((isMobile ? true : (window as any).pali) && !(window as any).ethereum) {
        console.log('Pali not activated for EVM');

        return undefined;
    }

    const injectedProviders: any[] = (window as any)?.ethereum.providers || []
    const injectedProvider: any =
        injectedProviders.find((provider) => {
            console.log(provider);
            return provider.isMetaMask ?? false
        }) ?? await detectEthereumProvider({ mustBeMetaMask: false })

    if (!injectedProvider) {
        console.log(`Pali wallet is not installed - you can get it under ${GET_PALI_LINK}`)
        return undefined
    }

    const provider = new providers.Web3Provider(injectedProvider, 'any')

    return provider
}

export class PaliWalletConnector implements Connector {
    public provider?: providers.Web3Provider
    public readonly name = 'PaliWalletV2'

    readonly update = new ConnectorEvent<ConnectorUpdateData>()

    private async init() {
        if (this.provider) return
        const metamask = await getMetamaskProvider()
        if (!metamask) {
            return
        }
        this.provider = metamask
    }

    async connectEagerly(): Promise<void> {
        await this.init()

        if (!this.provider) {
            return
        }

        try {
            const chainId: string = await this.provider!.send('eth_chainId', [])
            console.log(chainId);
            const accounts: string[] = await this.provider!.send('eth_accounts', [])
            console.log(accounts);
            this.update.emit({ chainId: parseInt(chainId), accounts })
        } catch (e: any) {

            let resolved = false;

            const errorMessage = (e.error.message || '');

            if (errorMessage === 'The requested account and/or method has not been authorized by the user.'
                || errorMessage === 'Method only available when connected on EVM chains'
            ) {
                // suppose we're at utxo



                await this.provider!.send(
                    "sys_changeUTXOEVM",
                    [{ chainId: 57 }],
                );

                const chainId: string = await this.provider!.send('eth_chainId', [])

                let accounts: string[] = []

                try {
                    accounts = await this.provider!.send('eth_requestAccounts', [])

                } catch (e: any) {
                    console.log(e);
                }

                if (!accounts) {
                    throw new Error('Could not activate connector: no accounts');;
                }
                console.log(chainId, accounts);
                this.update.emit({ chainId: parseInt(chainId), accounts })

                resolved = true;
            }


            if (!resolved) {
                throw new Error('Could not activate connector: ' + (e.message ?? ''))
            }
        }
    }

    async activate(): Promise<void> {

        console.log(`ACTIVATE`);
        await this.init()

        if (!this.provider) {
            throw new Error('Could not activate connector')
        }

        try {
            const chainId: string = await this.provider!.send('eth_chainId', [])
            const accounts: string[] = await this.provider!.send('eth_requestAccounts', [])

            console.log(accounts);

            if (typeof accounts[0] === 'string' && accounts[0].startsWith('sys')) {
                await this.provider!.send(
                    "eth_changeUTXOEVM",
                    [{ chainId: 57 }],
                );
            }

            // @ts-ignore
            if (accounts[0].success === false) {
                throw new Error('Could not activate connector: no accounts');
            }

            this.update.emit({ chainId: parseInt(chainId), accounts })
        } catch (e: any) {
            console.log(e)

            let resolved = false;

            const errorMessage = (e.error.message || '');

            if (errorMessage === 'The requested account and/or method has not been authorized by the user.'
                || errorMessage === 'Method only available when connected on EVM chains'
            ) {
                // suppose we're at utxo


                if (!isMobile) {
                    await this.provider!.send(
                        "eth_changeUTXOEVM",
                        [{ chainId: 57 }],
                    );
                }

                const chainId: string = await this.provider!.send('eth_chainId', [])
                // console.log(chainId)
                const accounts: string[] = await this.provider!.send('eth_requestAccounts', [])
                // console.log(chainId, accounts);
                this.update.emit({ chainId: parseInt(chainId), accounts })

                resolved = true;
            }


            if (!resolved) {
                throw new Error('Could not activate connector: ' + (e.message ?? ''))
            }
        }
    }

    async deactivate(): Promise<void> {
        this.provider = undefined
    }
}
