


export type APICall = (req: any, res: any) => any
 
import { BigNumber } from "ethers";
import web3utils from 'web3-utils'

export interface PayspecInvoice {

  payspecContractAddress: string,
  description : string,
  nonce: BigNumber,
  token: string,
  amountDue: BigNumber,
  payTo: string,
  feeAddresses: Array<string>,
  feePercents: Array<number>,
  expiresAt: number

}


export const ETH_ADDRESS = "0x0000000000000000000000000000000000000010" 


  export function getPayspecInvoiceUUID( invoiceData :PayspecInvoice )
{
  var payspecContractAddress = invoiceData.payspecContractAddress;
  var description = invoiceData.description;
  var nonce =invoiceData.nonce;
  var token =invoiceData.token;
  var amountDue =invoiceData.amountDue;
  var payTo =invoiceData.payTo;

  var feeAddresses = {t: 'address[]' , v:invoiceData.feeAddresses}
  var feePercents = {t: 'uint[]' , v:invoiceData.feePercents}
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