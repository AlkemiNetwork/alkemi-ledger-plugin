import "core-js/stable";
import "regenerator-runtime/runtime";
import { waitForAppScreen, zemu, genericTx, SPECULOS_ADDRESS, RANDOM_ADDRESS, txFromEtherscan} from './test.fixture';
import { ethers } from "ethers";
import { parseEther, parseUnits} from "ethers/lib/utils";

// EDIT THIS: Replace with your contract address
//const contractAddr = "0x82c19bdd07f9ca911ab8bc7bd5faf092736cfa64";
 const contractAddr = "0x397c315d64d74d82a731d656f9c4d586d200f90a";
// EDIT THIS: Replace `boilerplate` with your plugin name
const pluginName = "Alkemi";
const abi_path = `../${pluginName}/abis/` + contractAddr + '.json';
const abi = require(abi_path);


// Reference transaction for this test:
// https://etherscan.io/tx/0x0160b3aec12fd08e6be0040616c7c38248efb4413168a3372fc4d2db0e5961bb

// Nanos S test
// EDIT THIS: build your own test
test('[Nano S] Perform a supply', zemu("nanos", async (sim, eth) => {
  const contract = new ethers.Contract(contractAddr, abi);

  // Constants used to create the transaction
  // EDIT THIS: Remove what you don't need
  const amount = parseUnits("28471151959593036279", 'wei');
  const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
//   const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
  const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
  const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const asset = 'WETH';
//   const deadline = Number(1632843280);

  // EDIT THIS: adapt the signature to your method
  // signature: swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
  // EDIT THIS: don't call `swapExactETHForTokens` but your own method and adapt the arguments.
  const {data} = await contract.populateTransaction.supply(WETH, amount );

  // Get the generic transaction template
  let unsignedTx = genericTx;
  // Modify `to` to make it interact with the contract
  unsignedTx.to = contractAddr;
  // Modify the attached data
  unsignedTx.data = data;
  // EDIT THIS: get rid of this if you don't wish to modify the `value` field.
  // Modify the number of ETH sent
  //  unsignedTx.value = parseEther("0.1");

  // Create serializedTx and remove the "0x" prefix
  const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

  // Rather than constructing the tx ourselves, one can can obtain it directly through etherscan.
  // The rawTx of the tx up above is accessible through: https://etherscan.io/getRawTx?tx=0xb27a69cd3190ad0712da39f6b809ecc019ecbc319d3c17169853270226d18a8a
  // In this case, you could remove the above code, and simply create your tx like so:
  // const serializedTx = txFromEtherscan("0x02f9015a0181d38459682f0085215d7c1e598302a4e9947a250d5630b4cf539739df2c5dacb4c659f2488d88016345785d8a0000b8e47ff36ab50000000000000000000000000000000000000000000000018b1dd9dc51b5a9f7000000000000000000000000000000000000000000000000000000000000008000000000000000000000000015557c8b7246c38ee71ea6dc69e4347f5dac210400000000000000000000000000000000000000000000000000000000615336100000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b3595068778dd592e39a122f4f5a5cf09c90fe2c001a089c5ce4ce199f7d93ea1d54c08133fab9407d8de63a9885d59d8ce69a59573dda045f6a0e0d3288dfdfddc23ad0afb9577c4011801f598d581a46cd0b0e2bd0571");
  
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
