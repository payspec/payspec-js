import { expect, should } from 'chai'
import { Wallet } from 'ethers'
  
 
import {
    applyProtocolFee,
    generatePayspecInvoiceSimple,
    getPayspecContractDeployment, 
    getPayspecRandomNonce, 
    includesProtocolFee, 
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

        expect(mockinvoice.invoiceUUID).to.exist


    })

    it('should gen random nonce', () => {

        let nonce = getPayspecRandomNonce()

        console.log({nonce})

        expect(nonce).to.be.a('string')

     })



     it('should apply protocol fee', ()=>{

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

        let includesFeeBefore = includesProtocolFee(mockinvoice)

        expect(includesFeeBefore).to.eql(false)

        let updatedInvoice = applyProtocolFee(mockinvoice)

        let includesFeeAfter = includesProtocolFee(updatedInvoice)
 

        expect(includesFeeAfter).to.eql(true)

     })
 

 

})
