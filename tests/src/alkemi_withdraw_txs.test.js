import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan, nano_environments} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";
import Zemu from "@zondax/zemu";

// EDIT THIS: Replace with your contract address
const contractAddr = "0x397c315d64d74d82a731d656f9c4d586d200f90a";
const pluginName = "Alkemi";
const abi_path = `../${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);


// Reference transaction for this test:
// https://etherscan.io/tx/0xb2d802c061d489a8273ac92e1e8aaffbbc68037a9962ac72fa974b0b1b2c1933

nano_environments.forEach(function(model) {
    test(`[Nano ${model.letter}] Perform a withdraw`, zemu(model, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        const amount = parseUnits("28471151959593036279", 'wei');

        const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";

        const {data} = await contract.populateTransaction.withdraw(DAI, amount );

        // Get the generic transaction template
        let unsignedTx = genericTx;
        // Modify `to` to make it interact with the contract
        unsignedTx.to = contractAddr;
        // Modify the attached data
        unsignedTx.data = data;

        // Create serializedTx and remove the "0x" prefix
        const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

        const tx = eth.signTransaction(
            "44'/60'/0'/0",
            serializedTx
        );

        // Wait for the application to actually load and parse the transaction
        await waitForAppScreen(sim);
        let r_clicks = 5;
        if (model.letter == 'S') {
            r_clicks = 9;
        }
        await sim.navigateAndCompareSnapshots('.', `${model.name}_perform_a_withdraw`, [r_clicks, 0]);

        await tx;
        await Zemu.sleep(500);
    }))
});

nano_environments.forEach(function(model) {
    test(`[Nano ${model.letter}] Perform a withdraw for Max DAI`, zemu(model, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        // const amount = parseUnits("28471151959593036279", 'wei');
        const amount = parseUnits("115792089237316195423570985008687907853269984665640564039457584007913129639935", 'wei');

        const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";

        const {data} = await contract.populateTransaction.withdraw(DAI, amount );

        // Get the generic transaction template
        let unsignedTx = genericTx;
        // Modify `to` to make it interact with the contract
        unsignedTx.to = contractAddr;
        // Modify the attached data
        unsignedTx.data = data;

        // Create serializedTx and remove the "0x" prefix
        const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

        const tx = eth.signTransaction(
            "44'/60'/0'/0",
            serializedTx
        );

        // Wait for the application to actually load and parse the transaction
        await waitForAppScreen(sim);
        let r_clicks = 5;
        if (model.letter == 'S') {
            r_clicks = 7;
        }
        await sim.navigateAndCompareSnapshots('.', `${model.name}_perform_a_max_withdraw`, [r_clicks, 0]);

        await tx;
        await Zemu.sleep(500);
    }))
});
