export type APICall = (req: any, res: any) => any;
import { Web3Provider } from "@ethersproject/providers";
import { getNetworkNameFromChainId } from "./lib/contracts-helper";
export { getNetworkNameFromChainId };
export interface ProtocolFeeConfig {
    protocolFeePercentBasisPoints: number;
    protocolFeeRecipientAddress: string;
}
export interface PayspecInvoice {
    payspecContractAddress: string;
    metadataHash: string;
    nonce: string;
    token: string;
    chainId: string;
    payToArrayStringified: string;
    amountsDueArrayStringified: string;
    expiresAt: number;
    invoiceUUID?: string;
}
export interface PayspecPaymentElement {
    payTo: string;
    amountDue: string;
}
export declare const ETH_ADDRESS = "0x0000000000000000000000000000000000000010";
export declare function buildTokenDictionary(): any;
export declare function getTokenDataFromTokenDictionary(tokenDictionary: any, tokenAddress: string, chainId?: number): any;
export declare function getPayspecContractAddress(networkName: string): string;
export declare function getPayspecContractABI(): any;
export declare function getPayspecRandomNonce(size?: number): string;
export declare function getPayspecInvoiceUUID(invoiceData: PayspecInvoice): string | undefined;
export declare function applyInvoiceUUID(invoice: PayspecInvoice): PayspecInvoice;
export declare function applyProtocolFee(invoice: PayspecInvoice): PayspecInvoice;
export declare function applyProtocolFeeToPaymentElements(paymentElements: PayspecPaymentElement[]): PayspecPaymentElement[];
export declare function calculateSubtotalLessProtocolFee(paymentElements: PayspecPaymentElement[]): string;
export declare function includesProtocolFee(invoice: PayspecInvoice): boolean;
export declare function getPaymentElementsFromInvoice(invoice: PayspecInvoice): PayspecPaymentElement[];
export declare function getTotalAmountDueFromPaymentElementsArray(paymentElementsArray: PayspecPaymentElement[]): string;
export declare function getTotalAmountDueFromAmountsDueArray(amountsDueArray: string[]): string;
export declare function parseStringifiedArray(str: string): any[];
export declare function getCurrencyTokenAddress({ tokenName, chainId }: {
    tokenName: string;
    chainId: number;
}): string;
export declare function encodeInvoice(invoiceData: PayspecInvoice): string;
export declare function decodeInvoice(invoiceData: string): PayspecInvoice;
export declare function validateInvoice(invoiceData: PayspecInvoice): boolean;
export declare function getPayspecContractAddressFromChainId(chainId: number): string;
export declare function getPayspecPaymentDataFromPaymentsArray(elements: PayspecPaymentElement[]): {
    totalAmountDue: string;
    payToArrayStringified: string;
    amountsDueArrayStringified: string;
};
export declare function getPayspecExpiresInDelta(delta: number, timeUnits?: string): number;
export declare function getSmartInvoiceURLWithPaymentsArray({ baseUrl, tokenAddress, paymentsArray, chainId, metadata, nonce, expiration, expectedUUID }: {
    baseUrl: string;
    tokenAddress: string;
    paymentsArray: PayspecPaymentElement[];
    chainId: number;
    metadata: MetadataParams;
    nonce: string;
    expiration: number;
    expectedUUID?: string;
}): string;
export type MetadataParams = {
    [key: string]: string;
};
export declare function getSmartInvoiceURL({ baseUrl, tokenAddress, payTo, payAmount, chainId, metadata, nonce, expiration, expectedUUID }: {
    baseUrl: string;
    tokenAddress: string;
    payTo: string;
    payAmount: string;
    chainId: number;
    metadata: MetadataParams;
    nonce: string;
    expiration: number;
    expectedUUID?: string;
}): string;
export declare function getMetadataHash(metadata: MetadataParams): String;
export declare function generatePayspecInvoiceSimple({ chainId, metadataHash, tokenAddress, paymentsArray, durationSeconds }: {
    chainId: number;
    metadataHash: string;
    tokenAddress: string;
    paymentsArray: PayspecPaymentElement[];
    durationSeconds?: number;
}): PayspecInvoice;
export declare function generatePayspecInvoice({ payspecContractAddress, chainId, metadataHash, tokenAddress, paymentsArray, expiration, nonce }: {
    payspecContractAddress: string;
    chainId: number;
    metadataHash: string;
    tokenAddress: string;
    paymentsArray: PayspecPaymentElement[];
    expiration: number;
    nonce: string;
}): PayspecInvoice;
export declare function userPayInvoice({ from, invoiceData, provider }: {
    from: string;
    invoiceData: PayspecInvoice;
    provider: Web3Provider;
}): Promise<{
    success: boolean;
    error?: any;
    data?: any;
}>;
