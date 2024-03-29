export declare function getPayspecContractAddress(networkName: string): string;
export declare function getNetworkNameFromChainId(chainId: number): string;
export declare function getTokenFromConfig({ tokenName, networkName }: {
    tokenName: string;
    networkName: string;
}): {
    address: string;
    decimals: number;
    symbol: string;
};
export declare function getProtocolFeeConfig(): any;
