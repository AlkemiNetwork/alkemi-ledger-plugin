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
// https://etherscan.io/tx/0x5693eb0295b71f9a7704b2e991c49faa4a930987fa16b8ff86920eefbfdffd29

nano_environments.forEach(function(model) {
    test(`[Nano ${model.letter}] Perform a liquidate borrow`, zemu(model, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        const holder = "0xeb4d9c6614fe4d4d4ada2565a6d895ba3ea08796";
        const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
        const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
        const amount = parseUnits("28471151959593036279", 'wei');
        const {data} = await contract.populateTransaction.liquidateBorrow(holder, DAI, WETH, amount);

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
        let r_clicks = 8;
        if (model.letter == 'S') {
                r_clicks = 16;
        }
        await sim.navigateAndCompareSnapshots('.', `${model.name}_perform_a_liquidate_borrow`, [r_clicks, 0]);

        await tx;
        await Zemu.sleep(500);
    }))
});