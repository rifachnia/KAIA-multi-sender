import Caver from 'caver-js';
import { promises as fs} from 'fs';

const RPC_URL = 'https://public-en.node.kaia.io';
const caver = new Caver(RPC_URL);

// Function to read file
async function loadFile(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return data.split('\n').map(line => line.trim()).filter(line => line);
    } catch (error) {
        console.error(`❌ Failed to read file ${filename}: ${error.message}`);
        return [];
    }
}

// Main function to send KAIA
async function sendKAIA() {
    try {
        // Load deployer private key
        const senderPrivKey = await loadFile('deployerpriv.txt');
        if (senderPrivKey.length === 0) {
            console.log('❌ No deployer private key found in deployerpriv.txt');
            return;
        }
        const senderKey = senderPrivKey[0]; // Use only 1 deployer

        // Load recipient private keys
        const recipientPrivKeys = await loadFile('privkeys.txt');
        if (recipientPrivKeys.length === 0) {
            console.log('❌ No recipient private keys found in privkeys.txt');
            return;
        }

        console.log(`🚀 Sending KAIA to ${recipientPrivKeys.length} recipient wallet(s)...`);

        // Convert recipient private keys into addresses
        const recipientAddresses = recipientPrivKeys.map(privKey => {
            const keyring = caver.wallet.keyring.createFromPrivateKey(privKey);
            return keyring.address;
        });

        // Create keyring for deployer
        const senderKeyring = caver.wallet.keyring.createFromPrivateKey(senderKey);
        caver.wallet.add(senderKeyring);
        const senderAddress = senderKeyring.address;

        // Check deployer balance
        const balance = await caver.rpc.klay.getBalance(senderAddress);
        const balanceKAIA = caver.utils.fromPeb(balance, 'KLAY');

        console.log(`💰 Deployer balance: ${balanceKAIA} KAIA`);

        // Amount per transfer (read from CLI argument, default = 1 KAIA)
        const AMOUNT_PER_TX = process.argv[2] || '1.0';
        let nonce = await caver.rpc.klay.getTransactionCount(senderAddress);

        console.log(`📦 Amount per transfer set to: ${AMOUNT_PER_TX} KAIA`);

        if (parseFloat(balanceKAIA) < recipientAddresses.length * parseFloat(AMOUNT_PER_TX)) {
            console.log('❌ Insufficient balance to send to all recipients');
            return;
        }

        // Send transactions
        await Promise.all(
            recipientAddresses.map(async (recipient, index) => {
                try {
                    const valuePeb = caver.utils.toPeb(AMOUNT_PER_TX, 'KLAY');

                    const tx = caver.transaction.valueTransfer.create({
                        from: senderAddress,
                        to: recipient,
                        value: valuePeb,
                        gas: 25000,
                        nonce: nonce++,
                    });

                    await caver.wallet.sign(senderAddress, tx);
                    const receipt = await caver.rpc.klay.sendRawTransaction(tx.getRawTransaction());

                    console.log(`✅ [${index + 1}] ${AMOUNT_PER_TX} KAIA sent to ${recipient} | TX Hash: ${receipt.transactionHash}`);
                } catch (error) {
                    console.error(`❌ [${index + 1}] Failed to send to ${recipient}: ${error.message}`);
                }
            })
        );

        console.log('🏁 All transactions completed!');

    } catch (error) {
        console.error(`❌ Error while sending KAIA: ${error.message}`);
    }
}

// Run script
sendKAIA();
