# Payspec: Ethereum-Based Payments Processor Library
 
Payspec is a free, open-source payments processor library that runs on the Ethereum blockchain. This robust library is engineered to enable deterministic invoicing and one-time user payments for ecommerce platforms. It employs a smart contract written in Solidity for effective payment facilitation.

[Payspec Smart Contract on Etherscan](https://etherscan.io/address/0xef0Cb5Ba8947d374e3af4553218937a15eE19D08#code)

## Features

- 🚀 Supports deterministic invoicing
- 🌐 Multi-chain compatibility with support for different chain IDs
- 🛡️ Non-escrow neutral contract never holds funds for added security
- 💎 ERC20 and Ether compatible
- 🛒 Designed for ecommerce use-cases

## Installation

To install Payspec in your project, run the following command:

```
npm install payspec-js
```

## Usage

Here is a simple example demonstrating how to use the `getPayspecInvoiceUUID` function in JavaScript.

```javascript


 

import {generatePayspecInvoice,getMetadataHash,getPayspecContractAddress} from 'payspec-js';


let chainId = 1;
let networkName = "mainnet";

const invoiceData = {
  payspecContractAddress: getPayspecContractAddress(networkName),
  description: 'Example Invoice',
  nonce: '1234567890123456',
  token: '0x0000000000000000000000000000000000000000',
  totalAmountDue: '1000000000000000000',
  payToArrayStringified: '["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"]',
  amountsDueArrayStringified: '[500000000000000000, 500000000000000000]',
  expiresAt: 1648694400
};


let metadata = {};

let metadataHash =  getMetadataHash(metadata);

let paymentsArrayBasic = []

for (let i in  invoiceData.payToArrayStringified) {
     paymentsArrayBasic.push({
        payTo: invoiceData.payToArrayStringified[i],
        amountDue: invoiceData.amountsDueArrayStringified[i],
      });
}

let generatedInvoice = generatePayspecInvoice({
      payspecContractAddress: invoiceData.payspecContractAddress,
      tokenAddress: invoiceData.token,
      chainId,
      paymentsArray: paymentsArrayBasic,
      metadataHash,
      nonce: invoiceData.nonce,
      expiration: invoiceData.expiresAt,
    });

console.log({generatedInvoice}); //will have deterministic invoice uuid inside which is the hash of all of the params
//that deterministic hash (uuid) will be emitted when the payment is conducted so the ecommerce service will know the order was paid.  It cannot be paid twice enforced at the solidity level for better user experience. 
```

## API

### `getPayspecInvoiceUUID(invoiceData: PayspecInvoice) 

Generates a Universally Unique Identifier (UUID) for a Payspec invoice.

#### Parameters

- **invoiceData**: An object containing
  - `payspecContractAddress`: The address of the Payspec contract on the Ethereum network you are using.
  - `metadataHash`: A hash of optional metadata such as order description, product name, anything.
  - `nonce`: A random number used to prevent uuid collisions.
  - `token`: The address of the token used to pay the invoice (or Ether address for Ether payments).
  - `totalAmountDue`: The total amount due for the invoice, in Wei or token units.
  - `payToArrayStringified`: A JSON stringified array of Ethereum addresses that will receive payment.
  - `amountsDueArrayStringified`: A JSON stringified array of amounts due to each payee respectively in order, in wei or raw token units.
  - `expiresAt`: The timestamp (in utc unix seconds) after which the invoice will expire and will not be able to be paid.

#### Returns

A string containing the UUID for the invoice, or undefined if there was an error.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for how to improve this library, please [open an issue](https://github.com/your-username/payspec-js/issues) or submit a pull request on GitHub.

## Publishing

To publish a new version of the library:

```bash
yarn build
yarn publish
```

## Smart Contract Snippet (Solidity)

Here's a quick look into the Solidity smart contract that powers Payspec:

```solidity
struct Invoice {
  bytes32 uuid;
  address token;
  uint256 chainId;
  address[] payTo;
  uint[] amountsDue;
  bytes32 metadataHash; 
  uint256 nonce;
  address paidBy;
  uint256 paidAt; 
  uint256 expiresAt;
}




  function createAndPayInvoice( address token, address[] memory payTo, uint[] memory amountsDue,   uint256 nonce,   uint256 chainId, bytes32 metadataHash,uint256 expiresAt, bytes32 expecteduuid  ) 
    public 
    payable 
    nonReentrant
    returns (bool) {

     uint256 totalAmountDue = calculateTotalAmountDue(amountsDue);
     
     if(token == ETHER_ADDRESS){
       require(msg.value == totalAmountDue, "Transaction sent incorrect ETH amount.");
     }else{
       require(msg.value == 0, "Transaction sent ETH for an ERC20 invoice.");
     }
     
     bytes32 newuuid = _createInvoice(token,payTo,amountsDue, nonce, chainId, metadataHash, expiresAt,expecteduuid);
    
     return _payInvoice(newuuid);
  }

   function _createInvoice(  address token, address[] memory payTo, uint[] memory amountsDue, uint256 nonce, uint256 chainId, bytes32 metadataHash,  uint256 expiresAt, bytes32 expecteduuid ) 
    internal 
    returns (bytes32 uuid) { 


      bytes32 newuuid = getInvoiceUUID(token, payTo, amountsDue, nonce,  chainId, metadataHash, expiresAt ) ;

      require(!lockedByOwner);
      require( newuuid == expecteduuid , "Invalid invoice uuid");
      require( invoices[newuuid].uuid == 0 );  //make sure you do not overwrite invoices
      require(payTo.length == amountsDue.length, "Invalid number of amounts due");

      //require(ethBlockExpiresAt == 0 || block.number < expiresAt);

      invoices[newuuid] = Invoice({
       uuid:newuuid,
       metadataHash:metadataHash,
       nonce: nonce,
       token: token,

       chainId: chainId,

       payTo: payTo,
       amountsDue: amountsDue,
       
       paidBy: address(0),
        
       paidAt: 0,
       expiresAt: expiresAt 
      });


       emit CreatedInvoice(newuuid, metadataHash);

       return newuuid;
   }



```

For complete details, please refer to the [source code](https://github.com/payspec/payspec-js/tree/main/contracts).

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---
 
