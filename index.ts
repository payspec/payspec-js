


export type APICall = (req: any, res: any) => any
 
import { BigNumber } from "ethers";
import web3utils from 'web3-utils'

export interface PayspecInvoice {

  payspecContractAddress: string,
  description : string,
  nonce: string, //BigNumber,
  token: string,
  totalAmountDue: string, //BigNumber, 
  payToArrayStringified: string, //Array<string>, // use JSON.stringify and JSON.parse
  amountsDueArrayStringified: string, //Array<number>, // use JSON.stringify and JSON.parse
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
  var totalAmountDue = BigNumber.from(invoiceData.totalAmountDue);
  
  let payToArray = JSON.parse(invoiceData.payToArrayStringified)
  let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified)

  var payTo = {t: 'address[]' , v:payToArray}
  var amountsDue = {t: 'uint[]' , v:amountsDueArray}
  var expiresAt =invoiceData.expiresAt;

 
    
  return web3utils.soliditySha3(
    payspecContractAddress,
    description,
      // @ts-ignore
    nonce,
    token,
    totalAmountDue,
    payTo,
    amountsDue, 
    expiresAt );
} 


export function generateInvoiceUUID(invoiceData: PayspecInvoice) : PayspecInvoice {

  return Object.assign(invoiceData, {invoiceUUID: getPayspecInvoiceUUID(invoiceData)})

  
}