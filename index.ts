


export type APICall = (req: any, res: any) => any
 
import { BigNumber } from "ethers";
import web3utils from 'web3-utils'

export interface PayspecInvoice {

  payspecContractAddress: string,
  description : string,
  nonce: string, //BigNumber,
  token: string,
  amountDue: string, //BigNumber,
  payTo: string,
  feeAddressesArrayStringified: string, //Array<string>, // use JSON.stringify and JSON.parse
  feePercentsArrayStringified: string, //Array<number>, // use JSON.stringify and JSON.parse
  expiresAt: number,
  invoiceUUID?: string 

}


export const ETH_ADDRESS = "0x0000000000000000000000000000000000000010" 


export function getPayspecInvoiceUUID( invoiceData :PayspecInvoice )
{
  var payspecContractAddress = invoiceData.payspecContractAddress;
  var description = invoiceData.description;
  var nonce = BigNumber.from(invoiceData.nonce);
  var token =invoiceData.token;
  var amountDue = BigNumber.from(invoiceData.amountDue);
  var payTo =invoiceData.payTo;

  let feeAddressesArray = JSON.parse(invoiceData.feeAddressesArrayStringified)
  let feePercentsArray = JSON.parse(invoiceData.feePercentsArrayStringified)

  var feeAddresses = {t: 'address[]' , v:feeAddressesArray}
  var feePercents = {t: 'uint[]' , v:feePercentsArray}
  var expiresAt =invoiceData.expiresAt;

 
    
  return web3utils.soliditySha3(
    payspecContractAddress,
    description,
      // @ts-ignore
    nonce,
    token,
    amountDue,
    payTo,
    feeAddresses,
    feePercents,
    expiresAt );
} 


export function generateInvoiceUUID(invoiceData: PayspecInvoice) : PayspecInvoice {

  return Object.assign(invoiceData, {invoiceUUID: getPayspecInvoiceUUID(invoiceData)})

  
}