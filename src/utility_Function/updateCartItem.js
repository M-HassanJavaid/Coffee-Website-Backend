const { calculatePrice } = require("./CalculatePrice.js");
const { validateOptions } = require("./ValidateOptions.js");

async function validateAndUpdateCartItems(cartItems) {
    try {

        if (!cartItems) {
            return {
                status: 404,
                valid: false,
                message: 'No product found in cart!'
            }
        }

        let productOptionData = [];

        for (let i = 0; i < cartItems.length; i++) {

            const p = cartItems[i];

            let { valid, notAvailable, message, totalExtraPrice , productId} = await validateOptions(p.selectedOptions, p.product);


            if (!valid) {
                return {
                    status: 400,
                    valid: valid,
                    message: message
                }
            }

            if (valid && notAvailable) {
                cartItems.splice(i , 1);
                break;
            }

            productOptionData.push({ valid, message, totalExtraPrice , productId})
        }

        let itemsWithTotalPrice = await calculatePrice(cartItems, productOptionData);

        let totalPrice = 0;

        for (const product of itemsWithTotalPrice) {
            totalPrice += Number(product.price.total);
        }




        return {
            totalPrice,
            items: itemsWithTotalPrice,
            valid: true,
            status: 200
        }

    } catch (error) {

        return {
            status: 500,
            valid: false,
            message: error.message
        }
    }
}

module.exports = {
    validateAndUpdateCartItems
}