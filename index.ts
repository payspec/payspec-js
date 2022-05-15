


export type APICall = (req: any, res: any) => any
 
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber , Contract, utils } from "ethers";
import web3utils from 'web3-utils'



const payspecDeployment =  require('deployments/Payspec.json')
const payspecABI = payspecDeployment.abi

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

export function parseStringifiedArray(str: string): any[]{
  return JSON.parse( str  )
}


export async function userPayInvoice( from:string, invoiceData: PayspecInvoice, provider: Web3Provider ){

   

  let payspecContractInstance = new Contract( invoiceData.payspecContractAddress, payspecABI)


  let description = invoiceData.description
  let nonce = invoiceData.nonce
  let token = invoiceData.token
  let totalAmountDue = invoiceData.totalAmountDue
  let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified)
  let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified)
  let ethBlockExpiresAt = invoiceData.expiresAt
  let expectedUUID = invoiceData.invoiceUUID


  let txData = payspecContractInstance.populateTransaction.createAndPayInvoice(
    description,
    nonce,
    token,
    totalAmountDue, //wei
    payToArray,
    amountsDueArray,
    ethBlockExpiresAt,
    expectedUUID
    )


  let usesEther = ( token == ETH_ADDRESS )
  

  let totalAmountDueEth:string = usesEther ? totalAmountDue : '0'

  //calculate value eth -- depends on tokenAddre in invoice data 
  let valueEth = utils.parseUnits(totalAmountDueEth, 'wei').toHexString()

   
      const params = [{
        from,
        to: invoiceData.payspecContractAddress,
        data: txData,
        value: valueEth
    }];

    const transactionHash = await provider.send('eth_sendTransaction', params)
    console.log('transactionHash is ' + transactionHash);





}