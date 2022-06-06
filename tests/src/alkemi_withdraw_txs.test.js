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
// https://etherscan.io/tx/0xb2d802c061d489a8273ac92e1e8aaffbbc68037a9962ac72fa974b0b1b2c1933

// Nanos S test
// EDIT THIS: build your own test
test('[Nano S] Perform a withdraw for Max DAI', zemu("nanos", async (sim, eth) => {
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
  // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
  // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
  await sim.navigateAndCompareSnapshots('.', 'nanos_perform_a_withdraw', [7, 0]);

  await tx;
}));

// NanoX test
// EDIT THIS: build your own test
test.skip('[Nano X] Perform a withdraw', zemu("nanos", async (sim, eth) => {

  const serializedTx = txFromEtherscan("0x02f8b1013e849502f900851073c435b08312ba4294397c315d64d74d82a731d656f9c4d586d200f90a80b844f3fef3a30000000000000000000000001f52453b32bfab737247114d56d756a6c37dd9ef00000000000000000000000000000000000000000000000047edb70a0ed98000c001a0bc48dca961b68bc6061c734527d09ddb9bea135096a96b3b5c70becb2aaf41d7a003be9a36eb2101c86ca4b977e2caa030f3fe1b8989e43544fbb4c3395f63dbca");

  const tx = eth.signTransaction(
    "44'/60'/0'/0",
    serializedTx,
  );

  // Wait for the application to actually load and parse the transaction
  await waitForAppScreen(sim);
  // Navigate the display by pressing the right button 6 times, then pressing both buttons to accept the transaction.
  // await sim.navigateAndCompareSnapshots('.', 'nanox_perform_a_withdraw', [10, 0]);

  await tx;
}));
