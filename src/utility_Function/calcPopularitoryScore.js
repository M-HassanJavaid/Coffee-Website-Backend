

function calculatePopularityScore(product) {
  let addedInCart = product.addedInCart;  
  let sales = product.sales;
  let impressions = product.impressions;

  const score = (sales * 5) + (addedInCart * 3) + (impressions * 1);
  return score;
}

module.exports = {
    calculatePopularityScore
}