#include "alkemi_plugin.h"

// Copies the whole parameter (32 bytes long) from `src` to `dst`.
// Useful for numbers, data...
static void copy_parameter(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // Take the minimum between dst_len and parameter_length to make sure we don't overwrite memory.
    size_t len = MIN(dst_len, PARAMETER_LENGTH);
    memcpy(dst, src, len);
}

// Copies a 20 byte address (located in a 32 bytes parameter) `from `src` to `dst`.
// Useful for token addresses, user addresses...
static void copy_address(uint8_t *dst, size_t dst_len, uint8_t *src) {
    // An address is 20 bytes long: so we need to make sure we skip the first 12 bytes!
    size_t offset = PARAMETER_LENGTH - ADDRESS_LENGTH;
    size_t len = MIN(dst_len, ADDRESS_LENGTH);
    memcpy(dst, &src[offset], len);
}

// EDIT THIS: Remove this function and write your own handlers!
// One param functions handler
static void handle_multiple(ethPluginProvideParameter_t *msg, context_t *context) {
    switch (context->next_param) {
        case ASSET:
            copy_address(context->asset, sizeof(context->asset), msg->parameter);
            context->next_param = AMOUNT;
            break;
        case AMOUNT:
            copy_parameter(context->amount, sizeof(context->amount), msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        case HOLDER:  // claimALK
            copy_address(context->holder, sizeof(context->holder), msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

static void handle_liquidate_borrow(ethPluginProvideParameter_t *msg, context_t *context) {
    switch (context->next_param) {
        case TARGET_ACCOUNT:  // LiquidateBorrow
            copy_address(context->holder, sizeof(context->holder), msg->parameter);
            context->next_param = ASSET_BORROW;
            break;
        case ASSET_BORROW:  // LiquidateBorrow
            copy_address(context->asset, sizeof(context->asset), msg->parameter);
            context->next_param = ASSET_COLLATERAL;
            break;
        case ASSET_COLLATERAL:
            copy_address(context->assetCollateral,
                         sizeof(context->assetCollateral),
                         msg->parameter);
            context->next_param = REQUESTED_AMOUNT_CLOSE;
            break;
        case REQUESTED_AMOUNT_CLOSE:
            copy_parameter(context->amount, sizeof(context->amount), msg->parameter);
            context->next_param = UNEXPECTED_PARAMETER;
            break;
        default:
            PRINTF("Param not supported: %d\n", context->next_param);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}

void handle_provide_parameter(void *parameters) {
    ethPluginProvideParameter_t *msg = (ethPluginProvideParameter_t *) parameters;
    context_t *context = (context_t *) msg->pluginContext;
    // We use `%.*H`: it's a utility function to print bytes. You first give
    // the number of bytes you wish to print (in this case, `PARAMETER_LENGTH`) and then
    // the address (here `msg->parameter`).
    PRINTF("plugin provide parameter: offset %d\nBytes: %.*H\n",
           msg->parameterOffset,
           PARAMETER_LENGTH,
           msg->parameter);

    msg->result = ETH_PLUGIN_RESULT_OK;

    // EDIT THIS: adapt the cases and the names of the functions.
    switch (context->selectorIndex) {
        case ALKEMI_WITHDRAW:
        case ALKEMI_REPAY_BORROW:
        case ALKEMI_SUPPLY:
        case ALKEMI_BORROW:
        case ALKEMI_CLAIM_ALK:
            handle_multiple(msg, context);
            break;
        case ALKEMI_LIQUIDATE_BORROW:
            handle_liquidate_borrow(msg, context);
            break;
        default:
            PRINTF("Selector Index not supported: %d\n", context->selectorIndex);
            msg->result = ETH_PLUGIN_RESULT_ERROR;
            break;
    }
}