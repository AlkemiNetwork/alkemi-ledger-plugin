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
// https://etherscan.io/tx/0xc804fe8d14766c6eec285e7fa0431bd48e7e7bae81cb526719cd18c7f47776ce

// Nanos S test
// EDIT THIS: build your own test
test.skip('[Nano S] Perform a borrow', zemu("nanos", async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  const amount = parseUnits("28471151959593036279", 'wei');

  const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";

  const {data} = await contract.populateTransaction.borrow(DAI, amount );

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
  await sim.navigateAndCompareSnapshots('.', 'nanos_perform_a_borrow', [9, 0]);

  await tx;
}));

// NanoX test
// EDIT THIS: build your own test
test.skip('[Nano X] Perform a borrow', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8b20181b384540ae480851b3883a4fc83131a6494397c315d64d74d82a731d656f9c4d586d200f90a80b8444b8a3529000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000012309ce5400c001a09117aa7e40f57063151ca6e80e66ea7e5f8bb8334a1e4eeb250584faa68bcbd2a075f58ef5f528fed6b079eab88e18ef3f81a3a60e7b6b95b98e726eefb6f1ebbf");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  // await sim.navigateAndCompareSnapshots('.', 'nanox_perform_a_borrow', [10, 0]);

  await tx;
}));
