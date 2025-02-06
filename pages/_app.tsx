import { ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { Config, DAppProvider, MetamaskConnector, CoinbaseWalletConnector, Mainnet } from "@usedapp/core";
import { NEVMChain, RolluxChain, RolluxChainMainnet, TanenbaumChain } from "blockchain/NevmRolluxBridge/config/chainsUseDapp";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from "components/Common/ErrorFallback";
import { WelcomeDisclaimer } from "components/Common/WelcomeDisclaimer";
import { chakraTheme } from 'components/chakraTheme';
import { Provider } from "react-redux";
import store from "store";

const queryClient = new QueryClient();

const dappConfig: Config = {
  autoConnect: true,
  noMetamaskDeactivate: true,
  pollingIntervals: {
    [RolluxChain.chainId]: 30000,
    [TanenbaumChain.chainId]: 30000,
    [RolluxChainMainnet.chainId]: 30000,
    [NEVMChain.chainId]: 30000,
  },
  readOnlyUrls: {
    [TanenbaumChain.chainId]: TanenbaumChain.rpcUrl || '',
    [RolluxChain.chainId]: RolluxChain.rpcUrl || '',
    [RolluxChainMainnet.chainId]: RolluxChainMainnet.rpcUrl || '',
    [NEVMChain.chainId]: NEVMChain.rpcUrl || '',
  },
  multicallAddresses: {
    [RolluxChainMainnet.chainId]: RolluxChainMainnet.multicall2Address || '',
    [NEVMChain.chainId]: '0x0c457A8E4bD35eA571956d6bb7443c5C661d7607',
    [TanenbaumChain.chainId]: '0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697', // multicall 2 address.
    [RolluxChain.chainId]: '0xcA11bde05977b3631167028862bE2a173976CA11',

  },
  networks: [RolluxChain, TanenbaumChain, NEVMChain, RolluxChainMainnet]
}

declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean;
      request: (params: { method: string; params?: any }) => Promise<any>;
      isConnected: boolean;
      selectedAddress: string;
      on: (event: string, callback: (...args: any[]) => void) => void;
      networkVersion: string;
    }
  }
}


function MyApp({ Component, pageProps }: AppProps) {

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <DAppProvider config={dappConfig}>
            <ChakraProvider theme={chakraTheme}>
              <Component {...pageProps} />
              <WelcomeDisclaimer />
            </ChakraProvider>
          </DAppProvider>
        </ErrorBoundary>
      </Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
