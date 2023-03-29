import { expect, should } from 'chai'
import { BigNumber, Wallet } from 'ethers'
  
 
import {
    applyProtocolFee,
    calculateSubtotalLessProtocolFee,
    generatePayspecInvoiceSimple,
    getPayspecContractDeployment, 
    getPayspecRandomNonce, 
    includesProtocolFee, 
    PayspecInvoice,
    PayspecPaymentElement,
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

     it('should apply protocol fee with odd rounding', ()=>{

        let wallet = Wallet.createRandom()
 

        let mockinvoice = generatePayspecInvoiceSimple({
            chainId: 4,
            description: 'test',
            tokenAddress:'0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
            paymentsArray:[
                {
                    payTo: wallet.address,
                    amountDue: '1000001231512411'
                }
            ]
        })

        let includesFeeBefore = includesProtocolFee(mockinvoice)

        expect(includesFeeBefore).to.eql(false)

        let updatedInvoice = applyProtocolFee(mockinvoice)

        let includesFeeAfter = includesProtocolFee(updatedInvoice)
 

        expect(includesFeeAfter).to.eql(true)

     })

     it('should calc subtotal less protocol fee', ()=>{

        let wallet = Wallet.createRandom()
 
        let paymentElements:PayspecPaymentElement[] = [
            {
                payTo: wallet.address,
                amountDue: '17'
            }
        ]
        let subtotal = calculateSubtotalLessProtocolFee(paymentElements)

        expect(subtotal).to.eql('16')



     })


     //why does this fail ? 
     it('should apply protocol fee with fuzzy test inputs', ()=>{

        test_protocol_fee_application(BigNumber.from(0))

        test_protocol_fee_application(BigNumber.from(1)) 

        test_protocol_fee_application(BigNumber.from(17))

        test_protocol_fee_application(BigNumber.from(170))

        test_protocol_fee_application(BigNumber.from(1700))


     })
 

 

})



function test_protocol_fee_application( amountDue: BigNumber ){

    console.log(`test protocol fee application of amountDue ${amountDue}`)

    let wallet = Wallet.createRandom()
 

    let mockinvoice = generatePayspecInvoiceSimple({
        chainId: 4,
        description: 'test',
        tokenAddress:'0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
        paymentsArray:[
            {
                payTo: wallet.address,
                amountDue: amountDue.toString()
            }
        ]
    })

    let includesFeeBefore = includesProtocolFee(mockinvoice)

    expect(includesFeeBefore).to.eql(false)

    let updatedInvoice = applyProtocolFee(mockinvoice)


    console.log({updatedInvoice})

    let includesFeeAfter = includesProtocolFee(updatedInvoice)
    

    expect(includesFeeAfter).to.eql(true)

    let isValid = validateInvoice(updatedInvoice);

    expect(isValid).to.eql(true)
    
}
