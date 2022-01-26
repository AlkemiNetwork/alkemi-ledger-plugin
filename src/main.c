/*******************************************************************************
 *   Ethereum 2 Deposit Application
 *   (c) 2020 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#include "os.h"
#include "cx.h"

#include "alkemi_plugin.h"

// List of selectors supported by this plugin.
// EDIT THIS: Adapt the variable names and change the `0x` values to match your selectors.

/* From contract https://etherscan.io/address/0x82c19bdd07f9ca911ab8bc7bd5faf092736cfa64#code
from proxy https://etherscan.io/address/0x397c315d64D74d82A731d656f9C4D586D200F90A#code */
// static const uint8_t SWAP_EXACT_ETH_FOR_TOKENS_SELECTOR[SELECTOR_SIZE] = {0x7f, 0xf3, 0x6a, 0xb5};
// static const uint8_t BOILERPLATE_DUMMY_SELECTOR_2[SELECTOR_SIZE] = {0x13, 0x37, 0x42, 0x42};

static const uint8_t ALKEMI_WITHDRAW_SELECTOR[SELECTOR_SIZE] = {0xf3,0xfe,0xf3,0xa3}; // 0xf3fef3a3
static const uint8_t ALKEMI_REPAY_BORROW_SELECTOR[SELECTOR_SIZE] = {0xab,0xdb,0x5e,0xa8}; // 0xabdb5ea8
static const uint8_t ALKEMI_SUPPLY_SELECTOR[SELECTOR_SIZE] = {0xf2,0xb9,0xfd,0xb8}; // 0xf2b9fdb8
static const uint8_t ALKEMI_BORROW_SELECTOR[SELECTOR_SIZE] = {0x4b,0x8a,0x35,0x29}; // 0x4b8a3529
static const uint8_t ALKEMI_TRANSFER_SELECTOR[SELECTOR_SIZE] = {0xa9, 0x05, 0x9c, 0xbb};

/* From contract https://etherscan.io/address/0x14716c982fd8b7f1e8f0b4dbb496dce438a29d93 */
static const uint8_t ALKEMI_CLAIM_ALK_SELECTOR[SELECTOR_SIZE] = {0x71,0xd6,0xe8,0x92};

/* From ERC20 tokens contract */
static const uint8_t ALKEMI_APPROVE_SELECTOR[SELECTOR_SIZE] = {0x09, 0x5e, 0xa7, 0xb3};

// Array of all the different boilerplate selectors. Make sure this follows the same order as the
// enum defined in `boilerplate_plugin.h`
// EDIT THIS: Use the names of the array declared above.
const uint8_t *const ALKEMI_SELECTORS[NUM_SELECTORS] = {
    // SWAP_EXACT_ETH_FOR_TOKENS_SELECTOR,
    // BOILERPLATE_DUMMY_SELECTOR_2,
    // ALKEMI_APPROVE_SELECTOR,
    ALKEMI_WITHDRAW_SELECTOR,
    ALKEMI_REPAY_BORROW_SELECTOR,
    ALKEMI_SUPPLY_SELECTOR,
    ALKEMI_BORROW_SELECTOR,
    ALKEMI_CLAIM_ALK_SELECTOR,
};

// Function to dispatch calls from the ethereum app.
void dispatch_plugin_calls(int message, void *parameters) {
    switch (message) {
        case ETH_PLUGIN_INIT_CONTRACT:
            handle_init_contract(parameters);
            break;
        case ETH_PLUGIN_PROVIDE_PARAMETER:
            handle_provide_parameter(parameters);
            break;
        case ETH_PLUGIN_FINALIZE:
            handle_finalize(parameters);
            break;
        case ETH_PLUGIN_PROVIDE_TOKEN:
            handle_provide_token(parameters);
            break;
        case ETH_PLUGIN_QUERY_CONTRACT_ID:
            handle_query_contract_id(parameters);
            break;
        case ETH_PLUGIN_QUERY_CONTRACT_UI:
            handle_query_contract_ui(parameters);
            break;
        default:
            PRINTF("Unhandled message %d\n", message);
            break;
    }
}

// Calls the ethereum app.
void call_app_ethereum() {
    unsigned int libcall_params[3];
    libcall_params[0] = (unsigned int) "Ethereum";
    libcall_params[1] = 0x100;
    libcall_params[2] = RUN_APPLICATION;
    os_lib_call((unsigned int *) &libcall_params);
}

// Weird low-level black magic. No need to edit this.
__attribute__((section(".boot"))) int main(int arg0) {
    // Exit critical section
    __asm volatile("cpsie i");

    // Ensure exception will work as planned
    os_boot();

    // Try catch block. Please read the docs for more information on how to use those!
    BEGIN_TRY {
        TRY {
            // Low-level black magic.
            check_api_level(CX_COMPAT_APILEVEL);

            // Check if we are called from the dashboard.
            if (!arg0) {
                // Called from dashboard, launch Ethereum app
                call_app_ethereum();
                return 0;
            } else {
                // Not called from dashboard: called from the ethereum app!
                unsigned int *args = (unsigned int *) arg0;

                // If `ETH_PLUGIN_CHECK_PRESENCE` is set, this means the caller is just trying to
                // know whether this app exists or not. We can skip `dispatch_plugin_calls`.
                if (args[0] != ETH_PLUGIN_CHECK_PRESENCE) {
                    dispatch_plugin_calls(args[0], (void *) args[1]);
                }

                // Call `os_lib_end`, go back to the ethereum app.
                os_lib_end();
            }
        }
        FINALLY {
        }
    }
    END_TRY;

    // Will not get reached.
    return 0;
}
