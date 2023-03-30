 
 
 //import { readJSONFile } from "./file-helper"
 
 
 const protocolFeeConfig = require("../config/protocol-fee-config.json")
 const tokensConfig = require(`../config/tokens.json`)

 const payspecDeploymentsConfig = require(`../config/payspec-deployments.json`)

  /*
  Get the deployment data for a contract, including the address and abi 
  */
 /* export function getDeploymentConfig(networkName: string, contractName?: string) : {address:string,abi:any} {

    if(!contractName) contractName = 'Payspec'

    let f = readJSONFile(`deployments/${networkName}/${contractName}.json`)

    if(!f.address || !f.abi) throw new Error('Could not load deployment file from Payspec')
    
    return f 
  }*/


  export function getPayspecContractAddress(networkName: string) : string {

    return payspecDeploymentsConfig[networkName].payspec.address
  }


  export function getNetworkNameFromChainId(chainId:number) : string {

    if(isNaN(chainId)) throw new Error("chainId must be a number")
    
    switch(chainId){
      case 1: return 'mainnet'
      case 4: return 'rinkeby'
      case 5: return 'goerli'
      default: return 'unknown'
    }

  }

  export function getTokenFromConfig(
  {tokenName,networkName}
   :{ tokenName:string,
    networkName:string}
  ) :{address:string,decimals:number,symbol:string} {

   
    let tokenData = tokensConfig[networkName.toLowerCase()][tokenName.toLowerCase()]

    if(!tokenData.address || !tokenData.decimals || !tokenData.symbol) throw new Error('Could not load token config from Payspec')
    
    return tokenData
  }

 
      
export function getProtocolFeeConfig( ){

  return protocolFeeConfig
}
