#include "alkemi_plugin.h"

// EDIT THIS: You need to adapt / remove the static functions (set_send_ui, set_receive_ui ...) to
// match what you wish to display.

void set_address_ui(ethQueryContractUI_t *msg, context_t *context) {
    // Prefix the address with `0x`.

    msg->msg[0] = '0';
    msg->msg[1] = 'x';

    // We need a random chainID for legacy reasons with `getEthAddressStringFromBinary`.
    // Setting it to `0` will make it work with every chainID :)
    uint64_t chainid = 0;

    switch (context->selectorIndex) {
        case ALKEMI_CLAIM_ALK:
            getEthAddressStringFromBinary(context->holder,
                                          (uint8_t *) msg->msg + 2,
                                          msg->pluginSharedRW->sha3,
                                          chainid);
            break;
    }
}

static void set_first_param_ui(ethQueryContractUI_t *msg, context_t *context) {
    switch (context->selectorIndex) {
        case ALKEMI_WITHDRAW:
            strlcpy(msg->title, "Withdraw.", msg->titleLength);
            amountToString(context->requested_amount,
                           sizeof(context->requested_amount),
                           context->decimals,
                           context->ticker,
                           msg->msg,
                           msg->msgLength);
            break;
        case ALKEMI_SUPPLY:
            strlcpy(msg->title, "Supply.", msg->titleLength);
            amountToString(context->amount,
                           sizeof(context->amount),
                           context->decimals,
                           context->ticker,
                           msg->msg,
                           msg->msgLength);
            break;
        case ALKEMI_BORROW:
            strlcpy(msg->title, "Borrow.", msg->titleLength);
            amountToString(context->amount,
                           sizeof(context->amount),
                           context->decimals,
                           context->ticker,
                           msg->msg,
                           msg->msgLength);
            break;
        case ALKEMI_REPAY_BORROW:
            strlcpy(msg->title, "Repay borrow.", msg->titleLength);
            amountToString(context->amount,
                           sizeof(context->amount),
                           context->decimals,
                           context->ticker,
                           msg->msg,
                           msg->msgLength);
            break;
        case ALKEMI_CLAIM_ALK:
            strlcpy(msg->title, "Holder.", msg->titleLength);
            set_address_ui(msg, context);
            break;
    }
}

void handle_query_contract_ui(void *parameters) {
    ethQueryContractUI_t *msg = (ethQueryContractUI_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;

    // msg->title is the upper line displayed on the device.
    // msg->msg is the lower line displayed on the device.

    // Clean the display fields.
    memset(msg->title, 0, msg->titleLength);
    memset(msg->msg, 0, msg->msgLength);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: Adapt the cases for the screens you'd like to display.
    switch (msg->screenIndex) {
        case 0:
            set_first_param_ui(msg, context);
            break;
        // case 1:
        //     set_receive_ui(msg, context);
        //     break;
        // case 2:
        //     set_beneficiary_ui(msg, context);
        //     break;
        // Keep this
        default:
            PRINTF("Received an invalid screenIndex\n");
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            return;
    }
}
