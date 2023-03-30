import { expect, should } from 'chai'
import { BigNumber, Wallet } from 'ethers'
import { getPayspecContractAddress } from '../lib/contracts-helper'
   

describe('Contracts Helper', () => {
 
    
    it('should getPayspecContractAddress', () => {

 
        let address = getPayspecContractAddress('rinkeby')

        expect(address).to.be.a('string')


    })
    

})