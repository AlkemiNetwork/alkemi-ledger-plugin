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
// https://etherscan.io/tx/0xfe4efbbbb29179840c4ee7985d801d1a38fde57a2913a9b3323531d279bb8776

// Nanos S test
// EDIT THIS: build your own test
test.skip('[Nano S] Perform a supply', zemu("nanos", async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  const amount = parseUnits("28471151959593036279", 'wei');

  const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

  const {data} = await contract.populateTransaction.supply(WBTC, amount );

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
  // await sim.navigateAndCompareSnapshots('.', 'nanos_perform_a_supply', [10, 0]);

  await tx;
}));

// NanoX test
// EDIT THIS: build your own test
test.skip('[Nano X] Perform a supply', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8b20181b784540ae48085259f613e978310d4b494397c315d64d74d82a731d656f9c4d586d200f90a80b844f2b9fdb80000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000003b9aca00c080a07b9ed8272e9cc8226f31b96e72bbd914811db5f7f43873c02fee925ce238b8eca058082d66b37356a4a51014d6f82a8f5af932af486e49008574fa20e2ab20c417");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  // await sim.navigateAndCompareSnapshots('.', 'nanox_perform_a_supply', [10, 0]);

  await tx;
}));
