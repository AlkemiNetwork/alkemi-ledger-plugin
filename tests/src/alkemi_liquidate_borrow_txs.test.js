import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// EDIT THIS: Replace with your contract address
const contractAddr = "0x397c315d64d74d82a731d656f9c4d586d200f90a";
const pluginName = "Alkemi";
const abi_path = `../${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);


// Reference transaction for this test:
// https://etherscan.io/tx/0x5693eb0295b71f9a7704b2e991c49faa4a930987fa16b8ff86920eefbfdffd29

// Nanos S test
// EDIT THIS: build your own test
test.skip('[Nano S] Perform a Liquidate Borrow', zemu("nanos", async (sim, eth) => {
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
  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
  // await sim.navigateAndCompareSnapshots('.', 'nanos_perform_a Liquidate Borrow', [10, 0]);

  await tx;
}));

// NanoX test
// EDIT THIS: build your own test
test('[Nano X] Perform a Liquidate Borrow', zemu("nanos", async (sim, eth) => {

    // NO REAL LIQUIDATION BORROW TRANSACTION YET
//   const serializedTx = txFromEtherscan("0x02f892018201a3849502f9008526bf54a43a831624e99414716c982fd8b7f1e8f0b4dbb496dce438a29d9380a471d6e892000000000000000000000000123ceac83c6d5110671f09e96c0f8076ce4bc839c080a013d06b59d63c54d48bb9478bb05fd879377c7bb779e5b60099be45f24119979da03d4ad8745c6cb9c849dc3f215f9f9eaaeb30442a2a9b0dc4471361fb9470dcc4");

//   const tx = eth.signTransaction(
//     "44'/60'/0'/0",
//     serializedTx,
//   );

//   // Wait for the application to actually load and parse the transaction
//   await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  // await sim.navigateAndCompareSnapshots('.', 'nanox_perform_a Liquidate Borrow', [10, 0]);

  await tx;
}));
