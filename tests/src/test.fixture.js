import Zemu, {DeviceModel} from '@zondax/zemu';

import Eth from '@ledgerhq/hw-app-eth';
import { generate_plugin_config } from './generate_plugin_config';
import { parseEther, parseUnits, RLP} from "ethers/lib/utils";

const transactionUploadDelay = 60000;

async function waitForAppScreen(sim) {
    await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot(), transactionUploadDelay);
}

const Resolve = require('path').resolve;

const NANOS_ETH_PATH = Resolve('elfs/ethereum_nanos.elf');
const NANOX_ETH_PATH = Resolve('elfs/ethereum_nanox.elf');
const NANOSP_ETH_PATH = Resolve('elfs/ethereum_nanosp.elf');

const NANOS_PLUGIN_PATH = Resolve('elfs/plugin_nanos.elf');
const NANOX_PLUGIN_PATH = Resolve('elfs/plugin_nanox.elf');
const NANOSP_PLUGIN_PATH = Resolve('elfs/plugin_nanosp.elf');

// Edit this: replace `Boilerplate` by your plugin name
const NANOS_PLUGIN = { "Alkemi": NANOS_PLUGIN_PATH };
const NANOX_PLUGIN = { "Alkemi": NANOX_PLUGIN_PATH };
const NANOSP_PLUGIN = { "Alkemi": NANOSP_PLUGIN_PATH };

const boilerplateJSON = generate_plugin_config();

const SPECULOS_ADDRESS = '0xFE984369CE3919AA7BB4F431082D027B4F8ED70C';
const RANDOM_ADDRESS = '0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj'

const sim_options = {
    // Uncomment for testing
    // logging: true,
    X11: true,
    startDelay: 5000,
    startText: 'is ready',
    custom: '',
};

class PluginDeviceModel extends DeviceModel {
    letter: string;
    plugin;
    sdk: string;
}

const nano_environments: PluginDeviceModel[] = [
    { name: 'nanos', letter: 'S', path: NANOS_ETH_PATH, plugin: NANOS_PLUGIN, sdk: '2.1'},
    { name: 'nanox', letter: 'X', path: NANOX_ETH_PATH, plugin: NANOX_PLUGIN, sdk: '2.0.2'},
    { name: 'nanosp', letter: "SP", path: NANOSP_ETH_PATH, plugin: NANOSP_PLUGIN, sdk: '1.0'},
];

let genericTx = {
    nonce: Number(0),
    gasLimit: Number(21000),
    gasPrice: parseUnits('1', 'gwei'),
    value: parseEther('1'),
    chainId: 1,
    to: RANDOM_ADDRESS,
    data: null,
};

const TIMEOUT = 1000000;

// Generates a serializedTransaction from a rawHexTransaction copy pasted from etherscan.
function txFromEtherscan(rawTx) {
    // Remove 0x prefix
    rawTx = rawTx.slice(2);

    let txType = rawTx.slice(0, 2);
    if (txType == "02" || txType == "01") {
        // Remove "02" prefix
        rawTx = rawTx.slice(2);
    } else {
        txType = "";
    }

    let decoded = RLP.decode("0x" + rawTx);
    if (txType != "") {
        decoded = decoded.slice(0, decoded.length - 3); // remove v, r, s
    } else {
        decoded[decoded.length - 1] = "0x"; // empty
        decoded[decoded.length - 2] = "0x"; // empty
        decoded[decoded.length - 3] = "0x01"; // chainID 1
    }

    // Encode back the data, drop the '0x' prefix
    let encoded = RLP.encode(decoded).slice(2);

    // Don't forget to prepend the txtype
    return txType + encoded;
}

function zemu(device: PluginDeviceModel, func) {
    return async () => {
        jest.setTimeout(TIMEOUT);
        const sim = new Zemu(device.path, device.plugin);
        try {
            await sim.start({...sim_options, model: device.name, sdk: device.sdk});
            const transport = await sim.getTransport();
            const eth = new Eth(transport);
            eth.setLoadConfig({
                baseURL: null,
                extraPlugins: boilerplateJSON,
            });
            await func(sim, eth);
        } finally {
            await sim.close();
        }
    };
}

module.exports = {
    zemu,
    waitForAppScreen,
    genericTx,
    SPECULOS_ADDRESS,
    RANDOM_ADDRESS,
    txFromEtherscan,
    nano_environments,
}