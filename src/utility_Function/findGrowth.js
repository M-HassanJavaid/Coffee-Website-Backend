function findGrowth(current , previous) {
    return previous === 0
        ? (current === 0 ? 0 : 100)
        : ((current - previous) / previous * 100)
}

module.exports = { findGrowth }