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
// https://etherscan.io/tx/0x8f48b934dac3101f2d4811a02da318b2f287f43a02417fef26913992294b136f

// Nanos S test
// EDIT THIS: build your own test
test.skip('[Nano S] Perform a repay borrow', zemu("nanos", async (sim, eth) => {
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
  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
  await sim.navigateAndCompareSnapshots('.', 'nanos_perform_a_repay borrow', [9, 0]);

  await tx;
}));

// NanoX test
// EDIT THIS: build your own test
test.skip('[Nano X] Perform a repay borrow', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8b9013f849502f900850f3477f2fa831759f294397c315d64d74d82a731d656f9c4d586d200f90a8848a558b5011bf00eb844abdb5ea80000000000000000000000001f52453b32bfab737247114d56d756a6c37dd9ef00000000000000000000000000000000000000000000000048a558b5011bf00ec001a01d3a3c39363e882e1edbd2bca563f5cc3cbffba3d550944640f1e8f10a8c9b36a0676c241808850a4f32cb9a2a4343cdf91b6045c7c9abdc3d966836d2e4012871");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  // await sim.navigateAndCompareSnapshots('.', 'nanox_perform_a_repay borrow', [10, 0]);

  await tx;
}));
