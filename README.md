# 💸 KAIA Multi-Sender (Node.js)

A script for distributing KAIA from **one deployer wallet** to multiple recipient wallets.  
The amount sent per wallet can be set via **command-line argument**.

## ⚙️ Features
- Load **deployer private key** from `deployerpriv.txt`
- Load **multiple recipient private keys** from `privkeys.txt`
- Automatically convert recipient private keys into wallet addresses
- Send a fixed amount of KAIA (set via CLI, default = 1 KAIA)
- Use proper nonce handling for multiple transactions
- Display transaction hash for each transfer

## 🚀 Usage
1. Install dependencies:
   ```bash
   npm install
2. Prepare your input files:

   deployerpriv.txt → contains one private key (sender)
   privkeys.txt → contains multiple private keys (recipients)
   
   Example deployerpriv.txt:
   0xabcdef1234567890...
   
   Example privkeys.txt:
   0x123abc...
   0x456def...
   0x789ghi...



3. Run the script with the desired amount per transfer:
   # Default: 1.0 KAIA per wallet
   ```bash
   node otm.js

# Example: 25.5 KAIA per wallet
   ```bash
   node otm.js 25.5



⚠️ ## Notes

Ensure the deployer wallet has enough KAIA to cover all transfers plus gas fees.

Blockchain transactions are irreversible. Use with caution.

This project was built with AI-assisted development: my role was designing the workflow, testing behavior, and documenting usage, while AI generated the base code.

