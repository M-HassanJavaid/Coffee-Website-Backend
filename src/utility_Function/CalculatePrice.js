const { Product } = require("../models/product")


async function calculatePrice(items, productWithTotalExtraPrice) {
  let itemsWithPrice = await Promise.all(
    items.map(async (i) => {
      let productId = i.product;
      let productDetails = await Product.findById(productId);
      let productExtraPrice = 0;

      for (const p of productWithTotalExtraPrice) {
        if (p.productId === productId) {
          productExtraPrice = p.totalExtraPrice;
          break;
        }
      }

      let prices = {
        basePrice: productDetails.price,
        discountedPrice: productDetails.discountedPrice,
        extraPrice: productExtraPrice,
        discount: productDetails.discount,
        total:
          (Number(productDetails.discountedPrice) + Number(productExtraPrice)) * Number(i.quantity),
      };

      return {
        ...i,
        priceAtOrder: prices,
      };
    })
  );

  return itemsWithPrice;
}


module.exports = {
    calculatePrice
}