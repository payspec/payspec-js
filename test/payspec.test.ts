import { expect, should } from 'chai'
import { Wallet } from 'ethers'
  
 
import {
    generatePayspecInvoiceSimple,
    getPayspecContractDeployment, 
    getPayspecRandomNonce, 
    PayspecInvoice,
    validateInvoice

} from '../index'

describe('Payspec Js', () => {
 
    
    it('should get deployment config', () => {

 
        let deployment = getPayspecContractDeployment('rinkeby')

        expect(deployment.address).to.be.a('string')


    })
    

    it('should validate an invoice ', () => {

        let wallet = Wallet.createRandom()
 

        let mockinvoice = generatePayspecInvoiceSimple({
            chainId: 4,
            description: 'test',
            tokenAddress:'0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
            paymentsArray:[
                {
                    payTo: wallet.address,
                    amountDue: '1000000000000000000'
                }
            ]
        })
            
        let valid = validateInvoice(mockinvoice)

        expect(valid).to.eql(true)


    })
    

 

})
