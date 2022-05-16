 
 

 
import web3utils from 'web3-utils'


const deploymentFiles = {
  rinkeby: require('../../deployments/rinkeby/Payspec.json'),
  //mainnet: require('../deployments/mainnet/Payspec.json')

}

export default class ContractsHelper  {

  /*
  Get the deployment data for a contract, including the address and abi 
  */
  static getDeploymentConfig(networkName: string, contractName?: string) : {address:string,abi:any} {
    
    //@ts-ignore 
    let contents = deploymentFiles[networkName]

    return contents
  }

 
      
}