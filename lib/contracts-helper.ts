 
 
 import { readJSONFile } from "./file-helper"
 
 

  /*
  Get the deployment data for a contract, including the address and abi 
  */
  export function getDeploymentConfig(networkName: string, contractName?: string) : {address:string,abi:any} {

    if(!contractName) contractName = 'Payspec'

    let f = readJSONFile(`deployments/${networkName}/${contractName}.json`)

    if(!f.address || !f.abi) throw new Error('Could not load deployment file from Payspec')
    
    return f 
  }


  export function getNetworkNameFromChainId(chainId:number) : string {

    switch(chainId){
      case 1: return 'mainnet'
      case 4: return 'rinkeby'
      case 5: return 'goerli'
      default: return 'unknown'
    }

  }

 
      
