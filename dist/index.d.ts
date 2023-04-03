export type APICall = (req: any, res: any) => any;
import { Web3Provider } from "@ethersproject/providers";
export interface ProtocolFeeConfig {
    protocolFeePercentBasisPoints: number;
    protocolFeeRecipientAddress: string;
}
export interface PayspecInvoice {
    payspecContractAddress: string;
    description: string;
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
export declare function validateInvoice(invoiceData: PayspecInvoice): boolean;
export declare function getPayspecContractAddressFromChainId(chainId: number): string;
export declare function getPayspecPaymentDataFromPaymentsArray(elements: PayspecPaymentElement[]): {
    totalAmountDue: string;
    payToArrayStringified: string;
    amountsDueArrayStringified: string;
};
export declare function getPayspecExpiresInDelta(delta: number, timeUnits?: string): number;
export declare function generatePayspecInvoiceSimple({ chainId, description, tokenAddress, paymentsArray, durationSeconds }: {
    chainId: number;
    description: string;
    tokenAddress: string;
    paymentsArray: PayspecPaymentElement[];
    durationSeconds?: number;
}): PayspecInvoice;
export declare function userPayInvoice(from: string, invoiceData: PayspecInvoice, provider: Web3Provider, netName?: string): Promise<{
    success: boolean;
    error?: any;
    data?: any;
}>;
