const { calculatePrice } = require("./CalculatePrice.js");
const { validateOptions } = require("./ValidateOptions.js");

async function validateAndUpdateCartItems(cartItems) {
    try {

       let productOptionData = [];

        for (const i of cartItems) {
            let validation = await validateOptions(i.selectedOptions, i.product)
            if (!validation.valid) {
                return {
                    status: 400,
                    valid: validation.valid,
                    message: validation.message
                }
            }
            productOptionData.push(validation)
        }

        let itemsWithTotalPrice = await calculatePrice(cartItems, productOptionData);

        let totalPrice = 0;

        for (const product of itemsWithTotalPrice) {
            totalPrice += Number(product.price.total)
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