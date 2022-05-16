 
 

 
import web3utils from 'web3-utils'
import FileHelper from './file-helper'

export default class ContractsHelper  {

  /*
  Get the deployment data for a contract, including the address and abi 
  */
  static getDeploymentConfig(networkName: string, contractName: string) : {address:string,abi:any} {
    
    let contents = FileHelper.readJSONFile(`deployments/${networkName}/${contractName}.json`)

    return contents
  }

 
      
}