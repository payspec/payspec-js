import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, Contract, utils } from "ethers";
import web3utils from 'web3-utils';
import ContractsHelper from "./lib/contracts-helper";

// Define a type for a function that makes an API call
export type APICall = (req: any, res: any) => any;

// Define an interface for a Payspec invoice
export interface PayspecInvoice {
  payspecContractAddress: string;
  description: string;
  nonce: string;
  token: string;
  totalAmountDue: string;
  payToArrayStringified: string;
  amountsDueArrayStringified: string;
  expiresAt: number;
  invoiceUUID?: string;
}

// Define a constant for the Ethereum address
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000010";

// Get the Payspec contract deployment configuration for a given network
export function getPayspecContractDeployment(networkName: string): { address: string; abi: any } {
  return ContractsHelper.getDeploymentConfig(networkName);
}

// Generate a random nonce for a Payspec invoice
export function getPayspecRandomNonce(size?: number): string {
  if (!size) size = 16;
  return web3utils.randomHex(size);
}

// Generate a UUID for a Payspec invoice
export function getPayspecInvoiceUUID(invoiceData: PayspecInvoice): string | undefined {
  const payspecContractAddress = { t: 'address', v: invoiceData.payspecContractAddress };
  const description = { t: 'string', v: invoiceData.description };
  const nonce = { t: 'uint256', v: BigNumber.from(invoiceData.nonce).toString() };
  const token = { t:'address', v: invoiceData.token };
  const totalAmountDue = { t: 'uint256', v: BigNumber.from(invoiceData.totalAmountDue).toString() };
  
  const payToArray = JSON.parse(invoiceData.payToArrayStringified);
  const amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified);

  const payTo = { t: 'address[]' , v: payToArray };
  const amountsDue = { t: 'uint[]' , v: amountsDueArray };
  const expiresAt = { t: 'uint', v: invoiceData.expiresAt };
  
  const result = web3utils.soliditySha3(
    payspecContractAddress,
    description, 
    nonce,
    token,
    totalAmountDue,
    payTo,
    amountsDue, 
    expiresAt
  );

  return result ? result : undefined;
} 

// Add a UUID to a Payspec invoice
export function generateInvoiceUUID(invoiceData: PayspecInvoice): PayspecInvoice {
  return Object.assign(invoiceData, { invoiceUUID: getPayspecInvoiceUUID(invoiceData) });
  }
  
  // Parse a stringified array
  export function parseStringifiedArray(str: string): any[] {
  return JSON.parse(str);
  }
  
  // Pay a Payspec invoice on behalf of a user
  export async function userPayInvoice(
  from: string,
  invoiceData: PayspecInvoice,
  provider: Web3Provider,
  netName?: string
  ): Promise<{ success: boolean; error?: any; data?: any }> {
  const networkName = netName ? netName : 'mainnet';
  
  // Get the Payspec contract deployment configuration for the given network
  const payspecContractData = getPayspecContractDeployment(networkName);
  const payspecABI = payspecContractData.abi;
  const payspecAddress = payspecContractData.address;
  
  // Create an instance of the Payspec contract
  const payspecContractInstance = new Contract(invoiceData.payspecContractAddress, payspecABI);
  
  // Check that the contract address in the invoice data matches the expected contract address
  if (invoiceData.payspecContractAddress != payspecAddress) {
  console.error('Contract address mismatch', payspecAddress, invoiceData);
  }
  
  // Get the invoice details from the invoice data
  const description = invoiceData.description;
  const nonce = BigNumber.from(invoiceData.nonce).toString();
  const token = invoiceData.token;
  const totalAmountDue = BigNumber.from(invoiceData.totalAmountDue).toString();
  const payToArray = parseStringifiedArray(invoiceData.payToArrayStringified);
  const amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified);
  const ethBlockExpiresAt = invoiceData.expiresAt;
  const expectedUUID = invoiceData.invoiceUUID;
  
  // Get the signer for the user's account
  const signer = provider.getSigner();
  
  // Check if the invoice uses Ether or a token
  const usesEther = (token == ETH_ADDRESS);
  const totalAmountDueEth = usesEther ? totalAmountDue : '0';
  
  // Calculate the value to send with the transaction (in Ether or token units)
  const valueEth = utils.parseUnits(totalAmountDueEth, 'wei').toHexString();
  
  // Get the UUID for the invoice from the Payspec contract
  const contractInvoiceUUID = await payspecContractInstance.connect(signer).getInvoiceUUID(
  description,
  nonce,
  token,
  totalAmountDue,
  payToArray,
  amountsDueArray,
  ethBlockExpiresAt
  );
  
  // Check that the UUID from the Payspec contract matches the expected UUID
  if (contractInvoiceUUID != invoiceData.invoiceUUID) {
  console.error('Contract UUID mismatch', contractInvoiceUUID, invoiceData);
  } else {
  console.log('UUID match');
  }
  
  try {
  // Call the createAndPayInvoice function on the Payspec contract
  const tx = await payspecContractInstance.connect(signer).createAndPayInvoice(
  description,
  nonce,
  token,
  totalAmountDue,
  payToArray,
  amountsDueArray,
  ethBlockExpiresAt,
  expectedUUID,
  { from, value: valueEth }
  );
   
  
  // Return a success response with the transaction data
  return { success: true, data: tx };
  
  } catch (err) {
  // Return an error response with the error message
  return { success: false, error: err };
  }

  
  }
