


export type APICall = (req: any, res: any) => any
 
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber , Contract, ethers, utils } from "ethers";
 
import  {getDeploymentConfig, getNetworkNameFromChainId,getTokenFromConfig} from "./lib/contracts-helper";


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


export interface PayspecPaymentElement {
  payTo: string, //address
  amountDue: string //amount in raw units (wei) 
}


export const ETH_ADDRESS = "0x0000000000000000000000000000000000000010" 


export function getPayspecContractDeployment( networkName: string ): {address:string, abi:any }{
 

  return getDeploymentConfig(networkName)

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
  var totalAmountDue = {t: 'uint256', v: BigNumber.from(invoiceData.totalAmountDue).toString() };
  
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
    totalAmountDue,
    payTo,
    amountsDue, 
    expiresAt 
    );*/

    const result = ethers.utils.solidityKeccak256(
      ['address', 'string', 'uint256', 'address', 'uint256', 'address[]', 'uint256[]', 'uint256'],
      [payspecContractAddress.v, description.v, nonce.v, token.v, totalAmountDue.v, payTo.v, amountsDue.v, expiresAt.v]
    );

    return result ? result: undefined
} 


export function generateInvoiceUUID(invoiceData: PayspecInvoice) : PayspecInvoice {

  return Object.assign(invoiceData, {invoiceUUID: getPayspecInvoiceUUID(invoiceData)})

  
}

export function parseStringifiedArray(str: string): any[]{
  return JSON.parse( str  )
}


export function getCurrencyTokenAddress({
  tokenName,chainId
}:{tokenName:string, 
  chainId:number}) : string {
    
    let networkName = getNetworkNameFromChainId(chainId)

    return getTokenFromConfig({tokenName, networkName}).address

}

 
export function validateInvoice(invoiceData: PayspecInvoice): boolean {

  const requiredFields = [
    'payspecContractAddress',
    'description',
    'nonce',
    'token',
    'totalAmountDue',
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
  let totalAmountDue = BigNumber.from(invoiceData.totalAmountDue)
  let sumAmountsDue = BigNumber.from(0)
  amountsDueArray.forEach( (amountDue) => {
    sumAmountsDue = sumAmountsDue.add( BigNumber.from(amountDue) )
  })

  if(!totalAmountDue.eq(sumAmountsDue)) throw new Error('totalAmountDue must be equal to sum of amountsDueArray')

  return true;
 
}

export function getPayspecContractAddressFromChainId(chainId: number): string {

  const networkName = getNetworkNameFromChainId(chainId)
  
  const contractDeployment = getPayspecContractDeployment(networkName)

  return contractDeployment.address

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
      totalAmountDue,
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