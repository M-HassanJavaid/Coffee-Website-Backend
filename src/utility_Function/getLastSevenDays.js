function getLastSevenDays() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate( date.getDate() - 7 );
    return date
}

module.exports = getLastSevenDays