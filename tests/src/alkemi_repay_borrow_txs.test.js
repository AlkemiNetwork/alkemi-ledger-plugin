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
// https://etherscan.io/tx/0x8f48b934dac3101f2d4811a02da318b2f287f43a02417fef26913992294b136f

nano_environments.forEach(function(model) {
    test(`[Nano ${model.letter}] Perform a repay borrow`, zemu(model, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        const amount = parseUnits("28471151959593036279", 'wei');

        const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";

        const {data} = await contract.populateTransaction.repayBorrow(DAI, amount );

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
        await sim.navigateAndCompareSnapshots('.', `${model.name}_perform_a_repay_borrow`, [r_clicks, 0]);

        await tx;
        await Zemu.sleep(500);
    }))
});
