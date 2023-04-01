


export type APICall = (req: any, res: any) => any
 
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber , Contract, ethers, utils } from "ethers";
 
import  { getNetworkNameFromChainId,getProtocolFeeConfig,getTokenFromConfig} from "./lib/contracts-helper";

import { getPayspecContractAddress as getPayspecContractAddressFromHelper } from "./lib/contracts-helper";

const PayspecContractABI = require("./config/abi/payspec.abi.json")
 
export interface ProtocolFeeConfig{
  protocolFeePercentBasisPoints:number,
  protocolFeeRecipientAddress:string
}

export interface PayspecInvoice {

  payspecContractAddress: string,
  description : string,
  nonce: string, //BigNumber,
  token: string,
  chainId: string, //BigNumber, 
  payToArrayStringified: string, //Array<string>, // use JSON.stringify and JSON.parse
  amountsDueArrayStringified: string, //Array<number>, // use JSON.stringify and JSON.parse
  expiresAt: number,
  invoiceUUID?: string 

}


export interface PayspecPaymentElement {
  payTo: string, //address
  amountDue: string //amount in raw units (wei) 
}


export const ETH_ADDRESS = "0x0000000000000000000000000000000000000010" 


export function getPayspecContractAddress( networkName: string ):  string {
 

  return getPayspecContractAddressFromHelper(networkName)

}

export function getPayspecContractABI( ):  any {
 

  return PayspecContractABI

}

export function getPayspecRandomNonce (size?:number):string{

  if(!size) size = 16;
  
  return BigNumber.from( ethers.utils.randomBytes(size) ).toHexString()
  
}

export function getPayspecInvoiceUUID( invoiceData :PayspecInvoice )
{
  console.log('invoiceData',invoiceData)

  var payspecContractAddress = {t: 'address', v: invoiceData.payspecContractAddress};
  var description = {t: 'string', v: invoiceData.description};
  var nonce = {t: 'uint256', v: BigNumber.from(invoiceData.nonce).toString() } ;
  var token = {t:'address', v: invoiceData.token};
  var chainId = {t: 'uint256', v: BigNumber.from(invoiceData.chainId).toString() };
  
  let payToArray = JSON.parse(invoiceData.payToArrayStringified)
  let amountsDueArray = JSON.parse(invoiceData.amountsDueArrayStringified)

  var payTo = {t: 'address[]' , v:payToArray}
  var amountsDue = {t: 'uint[]' , v:amountsDueArray}
  var expiresAt = {t:'uint', v: invoiceData.expiresAt};

  
  /*
  test!!

  https://github.com/ethers-io/ethers.js/issues/671

  */
    
 /* let result =  ethers.utils.solidityKeccak256(
    payspecContractAddress,
    description, 
    nonce,
    token,
    chainId,
    payTo,
    amountsDue, 
    expiresAt 
    );*/

    const result = ethers.utils.solidityKeccak256(
      ['address', 'string', 'uint256', 'address', 'uint256', 'address[]', 'uint256[]', 'uint256'],
      [payspecContractAddress.v, description.v, nonce.v, token.v, chainId.v, payTo.v, amountsDue.v, expiresAt.v]
    );

    return result ? result: undefined
} 


export function applyInvoiceUUID(invoice: PayspecInvoice) : PayspecInvoice {

  return Object.assign(invoice, {invoiceUUID: getPayspecInvoiceUUID(invoice)})

}


export function applyProtocolFee(invoice: PayspecInvoice) : PayspecInvoice {

  if(includesProtocolFee(invoice)) return invoice;
  


  let paymentElements = getPaymentElementsFromInvoice(invoice)
  let originalTotalAmountDue:string = getTotalAmountDueFromPaymentElementsArray(paymentElements)


  // add the protocol fee to the payment elements 

  let updatedPaymentElements = applyProtocolFeeToPaymentElements(paymentElements)

  let { totalAmountDue,
    payToArrayStringified,
    amountsDueArrayStringified 
  } = getPayspecPaymentDataFromPaymentsArray(updatedPaymentElements)

 // if(totalAmountDue != originalTotalAmountDue) throw new Error('Unable to apply protocol fee: total amount update mismatch.  This is a bug in the payspec javascript lib.')


  let invoiceClone = Object.assign({},invoice)

  let updatedInvoice : PayspecInvoice = Object.assign( 
     invoiceClone, 
      {
      
      payToArrayStringified,
      amountsDueArrayStringified 
    } 
  )

  return updatedInvoice
 
   

}

 

export function applyProtocolFeeToPaymentElements(paymentElements:PayspecPaymentElement[]) : PayspecPaymentElement[] {

  const protocolFeeConfig:ProtocolFeeConfig= getProtocolFeeConfig();

  let originalTotalAmountDue:string = getTotalAmountDueFromPaymentElementsArray(paymentElements)

  let updatedPaymentElements:PayspecPaymentElement[] = []

  for(let element of paymentElements){

    //make sure rounding works well here 
    let amountDueLessFees = BigNumber.from(element.amountDue).mul(10000 - protocolFeeConfig.protocolFeePercentBasisPoints).div(10000)

    updatedPaymentElements.push({
      payTo: element.payTo,
      amountDue:  amountDueLessFees.toString()
    })

  } 

  let totalAmountDueLessFees = getTotalAmountDueFromPaymentElementsArray(updatedPaymentElements)


  let protocolFeeAmountDue = BigNumber.from(originalTotalAmountDue).sub(BigNumber.from(totalAmountDueLessFees)).toString()
 
  updatedPaymentElements.push({
    payTo: protocolFeeConfig.protocolFeeRecipientAddress,
    amountDue: protocolFeeAmountDue
  })

  return updatedPaymentElements

}


/*
  rounding is busted for bignumber .. 
*/
export function calculateSubtotalLessProtocolFee(paymentElements:PayspecPaymentElement[]) : string {

  const protocolFeeConfig:ProtocolFeeConfig= getProtocolFeeConfig();

 
  let updatedPaymentElements:PayspecPaymentElement[] = []

  for(let element of paymentElements){

    //make sure rounding works well here 
    let amountDueLessFees = BigNumber.from(element.amountDue).mul(10000 - protocolFeeConfig.protocolFeePercentBasisPoints).div(10000)

    updatedPaymentElements.push({
      payTo: element.payTo,
      amountDue:  amountDueLessFees.toString()
    })

  } 

  let totalAmountDueLessFees = getTotalAmountDueFromPaymentElementsArray(updatedPaymentElements)

  return totalAmountDueLessFees
}


/*
  this is busted 
*/
export function includesProtocolFee(invoice:PayspecInvoice) : boolean {
  const protocolFeeConfig:ProtocolFeeConfig= getProtocolFeeConfig();


  
  let paymentElements = getPaymentElementsFromInvoice(invoice)
  
  let originalTotalAmountDue = getTotalAmountDueFromPaymentElementsArray(paymentElements)


  //why is this 2 ?? 
  //let totalAmountDueLessFees = calculateSubtotalLessProtocolFee(paymentElements)

  let protocolFeePercentBasisPoints = protocolFeeConfig.protocolFeePercentBasisPoints
 // let protocolFeeAmount = BigNumber.from(originalTotalAmountDue).sub(BigNumber.from(totalAmountDueLessFees)).toString()
  
  let totalAmountDueLessFees = BigNumber.from(originalTotalAmountDue /*invoice.totalAmountDue*/).mul(10000).mul(10000 - protocolFeePercentBasisPoints).div(10000).div(10000)

  let protocolFeeAmount = BigNumber.from(originalTotalAmountDue).sub(totalAmountDueLessFees)

  console.log('payment elements' , JSON.stringify(paymentElements))

  console.log('includes protocol fee... ',
    originalTotalAmountDue.toString(),
    totalAmountDueLessFees.toString() ,
    protocolFeeAmount.toString()
  )

  const protocolFeeRecipient = ethers.utils.getAddress(getProtocolFeeConfig().protocolFeeRecipientAddress) 
 
  for(let element of paymentElements){
    if( ethers.utils.getAddress(element.payTo) == protocolFeeRecipient
     && BigNumber.from(element.amountDue).gte( protocolFeeAmount ) ){
      return true
    }
  }

  return false 

}

export function getPaymentElementsFromInvoice( invoice:PayspecInvoice ) : PayspecPaymentElement[] {

  const payToArray:string[] = parseStringifiedArray(invoice.payToArrayStringified)
  const amountsDueArray:string[] = parseStringifiedArray(invoice.amountsDueArrayStringified)


  let result:PayspecPaymentElement[] = []

  for(let i =0; i < payToArray.length; i++){
    result.push({
      payTo: payToArray[i],
      amountDue: amountsDueArray[i]
    })

  }

  return result

}

export function getTotalAmountDueFromPaymentElementsArray( paymentElementsArray:PayspecPaymentElement[] ) : string {

  let totalAmountDue = BigNumber.from(0)

  for(let element of paymentElementsArray){
    totalAmountDue = totalAmountDue.add(BigNumber.from(element.amountDue))
  }

  return totalAmountDue.toString()

}

export function getTotalAmountDueFromAmountsDueArray( amountsDueArray:string[] ) : string {

  let totalAmountDue = BigNumber.from(0)

  for(let amountDue of amountsDueArray){
    totalAmountDue = totalAmountDue.add(BigNumber.from(amountDue))
  }

  return totalAmountDue.toString()

}

export function parseStringifiedArray(str: string): any[]{
  return JSON.parse( str  )
}


export function getCurrencyTokenAddress({
  tokenName,chainId
}:{tokenName:string, 
  chainId:number}) : string {

    if(isNaN(chainId)) throw new Error("chainId must be a number")
    
    let networkName = getNetworkNameFromChainId(chainId)

    return getTokenFromConfig({tokenName, networkName}).address

}

 
export function validateInvoice(invoiceData: PayspecInvoice): boolean {

  const requiredFields = [
    'payspecContractAddress',
    'description',
    'nonce',
    'token',
    'chainId',
    'payToArrayStringified',
    'amountsDueArrayStringified',
    'expiresAt'
  ];

  //all keys must exist
  const invoiceFields = Object.keys(invoiceData);
  for (let i = 0; i < requiredFields.length; i++) {
    if (!invoiceFields.includes(requiredFields[i])) {
      throw new Error('Missing required field: ' + requiredFields[i]);
    }
  }

  //token must be an address 
  if(!ethers.utils.isAddress(invoiceData.token)) throw new Error('token must be an address')

  //pay to array stringified should be valid 
  let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified)
  let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified)


  if(payToArray.length != amountsDueArray.length) throw new Error('payToArrayStringified and amountsDueArrayStringified must be same length')
  if(!Array.isArray(payToArray)) throw new Error('payToArrayStringified must be an array')
  if(!Array.isArray(amountsDueArray)) throw new Error('amountsDueArrayStringified must be an array')

  //each pay to address must be valid
  payToArray.forEach( (payToAddress) => {
    if(!ethers.utils.isAddress(payToAddress)) throw new Error('payToAddress must be an address')
  })

  //total amount due must be equal to sum of amounts due array
 /* let totalAmountDue = BigNumber.from(invoiceData.totalAmountDue)
  let sumAmountsDue = BigNumber.from(0)
  amountsDueArray.forEach( (amountDue) => {
    sumAmountsDue = sumAmountsDue.add( BigNumber.from(amountDue) )
  })

  if(!totalAmountDue.eq(sumAmountsDue)) throw new Error('totalAmountDue must be equal to sum of amountsDueArray')
*/
  return true;
 
}

export function getPayspecContractAddressFromChainId(chainId: number): string {

  const networkName = getNetworkNameFromChainId(chainId)
  
  return getPayspecContractAddress(networkName)

}


//use gpt to write test for this 
export function getPayspecPaymentDataFromPaymentsArray(elements:PayspecPaymentElement[]): {
  totalAmountDue:string
  payToArrayStringified:string 
  amountsDueArrayStringified:string
}  {


  let totalAmountDue = BigNumber.from(0)
  let payToArray:string[] = []
  let amountsDueArray:string[] = []

  elements.forEach( (element) => {
    totalAmountDue = totalAmountDue.add( BigNumber.from(element.amountDue) )
    payToArray.push(element.payTo)
    amountsDueArray.push( BigNumber.from(element.amountDue).toString() )
  })

  return {
    totalAmountDue: totalAmountDue.toString(),
    payToArrayStringified: JSON.stringify(payToArray),
    amountsDueArrayStringified: JSON.stringify(amountsDueArray)
  }
   
}

//use gpt to write test for this 
export function getPayspecExpiresInDelta(delta:number, timeUnits?:string) : number {

  let currentTimeSeconds = Math.floor(Date.now() / 1000)

  if(!timeUnits) timeUnits = 'seconds'

  let deltaSeconds = 0

  switch(timeUnits){
    case 'seconds': deltaSeconds = delta; break;
    case 'minutes': deltaSeconds = delta * 60; break;
    case 'hours': deltaSeconds = delta * 60 * 60; break;
    case 'days': deltaSeconds = delta * 60 * 60 * 24; break;
    case 'weeks': deltaSeconds = delta * 60 * 60 * 24 * 7; break;
    case 'months': deltaSeconds = delta * 60 * 60 * 24 * 7 * 30; break;
  }

  return currentTimeSeconds + deltaSeconds
}


export function generatePayspecInvoiceSimple( 
  {
    chainId,
    description,
    tokenAddress,
    paymentsArray
  }:{

    chainId: number,
    description: string,
    tokenAddress: string,
    paymentsArray: PayspecPaymentElement[]

  }

) : PayspecInvoice{


  const payspecContractAddress = getPayspecContractAddressFromChainId(chainId)

  const nonce = getPayspecRandomNonce()

  const expiresAt = getPayspecExpiresInDelta( 50000 , 'seconds' )


  const {
      totalAmountDue, 
      payToArrayStringified, 
      amountsDueArrayStringified
  } = getPayspecPaymentDataFromPaymentsArray(paymentsArray)

  const invoice:PayspecInvoice = {
      payspecContractAddress: payspecContractAddress,
      description, //can use product id here
      nonce,
      token: tokenAddress,
      chainId: chainId.toString(),
      payToArrayStringified,
      amountsDueArrayStringified,
      expiresAt
  }

  invoice.invoiceUUID = getPayspecInvoiceUUID(invoice)

  return invoice 

}

//---------


export async function userPayInvoice( from:string, invoiceData: PayspecInvoice, provider: Web3Provider, netName?: string ) : Promise<{success:boolean, error?:any, data?: any}> {

  let networkName = netName? netName : 'mainnet'

  
  let payspecABI = getPayspecContractABI()
  let payspecAddress = getPayspecContractAddress(networkName)

  


  let payspecContractInstance = new Contract( invoiceData.payspecContractAddress, payspecABI)

  if(invoiceData.payspecContractAddress != payspecAddress){
    console.error('Contract address mismatch', payspecAddress, invoiceData)
  }

  let description = invoiceData.description
  let nonce = BigNumber.from( invoiceData.nonce).toString()
  let token = invoiceData.token
  let chainId = BigNumber.from(invoiceData.chainId).toString()
  let payToArray = parseStringifiedArray(invoiceData.payToArrayStringified)
  let amountsDueArray = parseStringifiedArray(invoiceData.amountsDueArrayStringified)
  let ethBlockExpiresAt = invoiceData.expiresAt
  
  let totalAmountDue = getTotalAmountDueFromAmountsDueArray(amountsDueArray)
 
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
    chainId, 
    payToArray,
    amountsDueArray,
    ethBlockExpiresAt


  )

  if(contractInvoiceUUID != invoiceData.invoiceUUID){
    console.error('contract MISMATCH UUID ', contractInvoiceUUID, invoiceData )

    throw new Error("Mismatching UUID calculated")
  } 

 
  try{
    let tx = await payspecContractInstance.connect(signer).createAndPayInvoice(
      description,
      nonce,
      token,
      chainId, //wei
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