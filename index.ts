


export type APICall = (req: any, res: any) => any
 
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber , Contract, utils } from "ethers";
import web3utils from 'web3-utils'
import ContractsHelper from "./lib/contracts-helper";


/*
const payspecDeployment =  require('../deployments/rinkeby/Payspec.json')
const payspecABI = payspecDeployment.abi
export const PayspecContractAddress = payspecDeployment.address
*/

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


export function getPayspecContractDeployment( networkName: string ): {address:string, abi:any }{
 

  return ContractsHelper.getDeploymentConfig(networkName)

}

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

  console.log('getPayspecInvoiceUUID , ' ,  payspecContractAddress,
  description,
    // @ts-ignore
  nonce,
  token,
  totalAmountDue,
  payTo,
  amountsDue, 
  expiresAt)
    
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


export async function userPayInvoice( from:string, invoiceData: PayspecInvoice, provider: Web3Provider, netName?: string ){

  let networkName = netName? netName : 'mainnet'

  let payspecContractData = getPayspecContractDeployment(networkName)
  let payspecABI = payspecContractData.abi 


  let payspecContractInstance = new Contract( invoiceData.payspecContractAddress, payspecABI)


  let description = invoiceData.description
  let nonce = BigNumber.from( invoiceData.nonce)
  let token = invoiceData.token
  let totalAmountDue = invoiceData.totalAmountDue
  let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified)
  let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified)
  let ethBlockExpiresAt = invoiceData.expiresAt
  let expectedUUID = invoiceData.invoiceUUID

  console.log('populate tx ',
  description,
  nonce,
  token,
  totalAmountDue, //wei
  payToArray,
  amountsDueArray,
  ethBlockExpiresAt,
  expectedUUID
  )

  let signer = provider.getSigner()

  let usesEther = ( token == ETH_ADDRESS )  

  let totalAmountDueEth:string = usesEther ? totalAmountDue : '0'

  //calculate value eth -- depends on tokenAddre in invoice data 
  let valueEth = utils.parseUnits(totalAmountDueEth, 'wei').toHexString()



  let tx = await payspecContractInstance.connect(signer).createAndPayInvoice( description,
    nonce,
    token,
    totalAmountDue, //wei
    payToArray,
    amountsDueArray,
    ethBlockExpiresAt,
    expectedUUID, {from,value: valueEth})

    console.log('tx',tx)

    return 


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

    console.log('txData',txData)
 
    const params = [{
        from,
        to: invoiceData.payspecContractAddress,
        data: txData,
        value: valueEth
    }];

    const transactionHash = await provider.send('eth_sendTransaction', params)
    console.log('transactionHash is ' + transactionHash);





}