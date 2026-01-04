function getLastNintyDays() {
    let date = new Date();
    date.setHours(0,0,0,0);
    date.setDate( date.getDate() - 90 );
    return date
}

module.exports = getLastNintyDays