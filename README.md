## Payspec JS 
  

This is a TypeScript library for interacting with the Payspec smart contract on the Ethereum blockchain.
 

Deterministic invoicing and payments for Web3

---

To use this library, you can install it via NPM:

```
npm install payspec-typescript-library
```


### Usage

Here is an example of how to use the getPayspecInvoiceUUID function in JavaScript:
 
```
const payspec = require('payspec-typescript-library');

const invoiceData = {
  payspecContractAddress: '0x1234567890123456789012345678901234567890',
  description: 'Example Invoice',
  nonce: '1234567890123456',
  token: '0x0000000000000000000000000000000000000000',
  totalAmountDue: '1000000000000000000',
  payToArrayStringified: '["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"]',
  amountsDueArrayStringified: '[500000000000000000, 500000000000000000]',
  expiresAt: 1648694400
};

const uuid = payspec.getPayspecInvoiceUUID(invoiceData);

console.log(uuid);

```


### API

getPayspecInvoiceUUID(invoiceData: PayspecInvoice): string | undefined

Generates a Universally Unique Identifier (UUID) for a Payspec invoice.

    invoiceData - An object containing the following properties:
        payspecContractAddress - The address of the Payspec contract on the Ethereum blockchain.
        description - A description of the invoice.
        nonce - A random number used to prevent replay attacks.
        token - The address of the token used to pay the invoice (or 0x0000000000000000000000000000000000000000 for Ether).
        totalAmountDue - The total amount due for the invoice, in Wei or token units.
        payToArrayStringified - A JSON stringified array of Ethereum addresses that will receive payment for the invoice.
        amountsDueArrayStringified - A JSON stringified array of amounts due to each payee, in Wei or token units.
        expiresAt - The timestamp (in seconds) after which the invoice will expire.

Returns a string containing the UUID for the invoice, or undefined if there was an error.


### Contributing

If you find any bugs or have suggestions for how to improve this library, please open an issue or a pull request on GitHub.

