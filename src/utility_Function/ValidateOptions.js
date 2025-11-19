const { Product } = require('../models/product.js');

async function validateOptions(orderedOptions, productId) {
    const product = await Product.findById(productId);

    if (!product) {
        return {
            valid: false,
            message: "Inavlid Product Id",
            totalExtraPrice: 0,
        }
    }

    if (!product.isAvailaible) {
        return {
            valid: true,
            message: `${product.name} is sold out!`,
            totalExtraPrice: 0,
            notAvailable: true,
            productId
        }
    }

    const productOptions = product.options;

   
    // 1️⃣ Check if all required fields are provided
    for (const productOption of productOptions) {
        if (productOption.isRequired) {
            let found = false;

            for (const orderedOption of orderedOptions) {
                if (orderedOption.name === productOption.name) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                return {
                    valid: false,
                    totalExtraPrice: 0,
                    message: `${productOption.name} is required!`
                };
            }
        }
    }

    // 2️⃣ Check for extra fields (not defined in schema)
    for (const orderedOption of orderedOptions) {
        let found = false;

        for (const productOption of productOptions) {
            if (orderedOption.name === productOption.name) {
                found = true;
                break;
            }
        }

        if (!found) {
            return {
                valid: false,
                totalExtraPrice: 0,
                message: `${orderedOption.name} is not a valid field!`
            };
        }
    }

    // 3️⃣ Validate each value and calculate total extra price
    let totalExtraPrice = 0;

    for (const orderedOption of orderedOptions) {
        // Find the schema option that matches the ordered one
        const productOption = productOptions.find(opt => opt.name === orderedOption.name);
        const availableValues = productOption.values;

        let foundValue = false;

        // Checking is option required
        if (!orderedOption.value && !productOption.isRequired) {
            break;
        }

        for (const optionValue of availableValues) {
            if (optionValue.label === orderedOption.value) {
                // ✅ Value is valid, add its price
                totalExtraPrice += optionValue.extraPrice;
                foundValue = true;
                break;
            }
        }

        if (!foundValue) {
            return {
                valid: false,
                totalExtraPrice: 0,
                message: `"${orderedOption.value}" is not a valid value for "${orderedOption.name}".`,
            };
        }
    }

    // ✅ All checks passed

    // console.log("Total extra price for each product =>" + totalExtraPrice)

    return {
        productId: productId,
        valid: true,
        totalExtraPrice,
        message: "All options are valid!"
    };
}

module.exports = { validateOptions };
