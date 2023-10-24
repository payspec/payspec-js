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

### `getPayspecInvoiceUUID(invoiceData: PayspecInvoice): string | undefined`

Generates a Universally Unique Identifier (UUID) for a Payspec invoice.

#### Parameters

- **invoiceData**: An object containing
  - `payspecContractAddress`: The address of the Payspec contract on the Ethereum blockchain.
  - `description`: A description of the invoice.
  - `nonce`: A random number used to prevent replay attacks.
  - `token`: The address of the token used to pay the invoice (or Ether address for Ether payments).
  - `totalAmountDue`: The total amount due for the invoice, in Wei or token units.
  - `payToArrayStringified`: A JSON stringified array of Ethereum addresses that will receive payment.
  - `amountsDueArrayStringified`: A JSON stringified array of amounts due to each payee, in Wei or token units.
  - `expiresAt`: The timestamp (in seconds) after which the invoice will expire.

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

Here's a quick look at the Solidity smart contract that powers Payspec:

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
```

For complete details, please refer to the [source code](https://github.com/your-username/payspec-js/tree/main/contracts).

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---
 
