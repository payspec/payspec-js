import { expect, should } from 'chai'
import { BigNumber, Wallet } from 'ethers'
import { getDeploymentConfig } from '../lib/contracts-helper'
   

describe('Contracts Helper', () => {
 
    
    it('should get deployment config', () => {

 
        let deployment = getDeploymentConfig('rinkeby')

        expect(deployment.address).to.be.a('string')


    })
    

})