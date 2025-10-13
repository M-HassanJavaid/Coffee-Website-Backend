const { Product } = require("../models/product")


async function calculatePrice(items, productWithTotalExtraPrice) {

  let itemsWithPrice = await Promise.all(
    items.map(async (i) => {
      let productId = i.product;
      let productDetails = await Product.findById(productId).lean();
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
        totalExtraPrice: Number(productExtraPrice) * Number(i.quantity),
        discount: productDetails.discount,
        total: (Number(productDetails.discountedPrice) + Number(productExtraPrice)) * Number(i.quantity),
      };


      i = i.toObject();

      return {
        ...i,
        price: prices,
      };
    })
  );

  return itemsWithPrice;
}


module.exports = {
    calculatePrice
}