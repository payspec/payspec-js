


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

export function getPayspecRandomNonce (size?:number){

  if(!size) size = 16;
   
  return web3utils.randomHex(size)
}

export function getPayspecInvoiceUUID( invoiceData :PayspecInvoice )
{
  console.log('invoiceData',invoiceData)

  var payspecContractAddress = {t: 'address', v: invoiceData.payspecContractAddress};
  var description = {t: 'string', v: invoiceData.description};
  var nonce = {t: 'uint256', v: BigNumber.from(invoiceData.nonce).toString() } ;
  var token = {t:'address', v: invoiceData.token};
  var totalAmountDue = {t: 'uint256', v: BigNumber.from(invoiceData.totalAmountDue).toString() };
  
  let payToArray = JSON.parse(invoiceData.payToArrayStringified)
  let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified)

  var payTo = {t: 'address[]' , v:payToArray}
  var amountsDue = {t: 'uint[]' , v:amountsDueArray}
  var expiresAt = {t:'uint', v: invoiceData.expiresAt};

  
    
  return web3utils.soliditySha3(
    payspecContractAddress,
    description, 
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


export async function userPayInvoice( from:string, invoiceData: PayspecInvoice, provider: Web3Provider, netName?: string ) : Promise<{success:boolean, error?:any, data?: any}> {

  let networkName = netName? netName : 'mainnet'

  let payspecContractData = getPayspecContractDeployment(networkName)
  let payspecABI = payspecContractData.abi 
  let payspecAddress = payspecContractData.address 

  


  let payspecContractInstance = new Contract( invoiceData.payspecContractAddress, payspecABI)

  if(invoiceData.payspecContractAddress != payspecAddress){
    console.error('Contract address mismatch', payspecAddress, invoiceData)
  }

  let description = invoiceData.description
  let nonce = BigNumber.from( invoiceData.nonce).toString()
  let token = invoiceData.token
  let totalAmountDue = BigNumber.from(invoiceData.totalAmountDue).toString()
  let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified)
  let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified)
  let ethBlockExpiresAt = invoiceData.expiresAt
  
    
 
  let expectedUUID = invoiceData.invoiceUUID
  

  let signer = provider.getSigner()

  let usesEther = ( token == ETH_ADDRESS )  

  let totalAmountDueEth:string = usesEther ? totalAmountDue : '0'

  //calculate value eth -- depends on tokenAddre in invoice data 
  let valueEth = utils.parseUnits(totalAmountDueEth, 'wei').toHexString()


  let contractInvoiceUUID = await payspecContractInstance.connect(signer).getInvoiceUUID(
    description,
    nonce,
    token,
    totalAmountDue, //wei
    payToArray,
    amountsDueArray,
    ethBlockExpiresAt


  )

  if(contractInvoiceUUID != invoiceData.invoiceUUID){
    console.error('contract MISMATCH UUID ', contractInvoiceUUID, invoiceData )
  }else{
    console.log('uuid match2 ')
  }

 
  try{
    let tx = await payspecContractInstance.connect(signer).createAndPayInvoice(
      description,
      nonce,
      token,
      totalAmountDue, //wei
      payToArray,
      amountsDueArray,
      ethBlockExpiresAt,
      expectedUUID,
      {from,value: valueEth})

      return {success:true, data: tx }
  }catch(err){

      return {success:false, error: err }
  }
      

}