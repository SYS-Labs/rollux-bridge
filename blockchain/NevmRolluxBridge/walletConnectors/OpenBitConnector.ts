import { MetamaskConnector } from "@usedapp/core";

import { providers } from "ethers";

declare global {
  interface Window {
    OpenBit: any;
  }
}

export class OpenBitWalletConnector extends MetamaskConnector {
  activate(): Promise<void> {
    const wallet = window.OpenBit;

    if (!wallet?.isOpenBit) {
      console.warn("OpenBit is not installed");
    }
    this.provider = new providers.Web3Provider(wallet);
    return super.activate();
  }
}
