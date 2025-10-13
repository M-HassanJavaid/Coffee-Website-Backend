
const { Product } = require("../models/product");
const { calculatePopularityScore } = require("./calcPopularitoryScore");

async function updatePopularitoryScore(items) {
    try {
        for (const item of items) {

            let productId = item.productId.toString();

            let product = await Product.findById(productId);

            let quantity = item.quantity;

            product.addedInCart = product.addedInCart - quantity;

            product.sales = product.sales + quantity;

            let popularityScore = calculatePopularityScore(product);

            product.popularityScore = popularityScore;

            await product.save()
        }

    } catch (error) {

        console.log(error.message)

    }
}

module.exports = {
    updatePopularitoryScore
}