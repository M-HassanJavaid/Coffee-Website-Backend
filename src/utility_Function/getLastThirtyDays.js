function getLastThirtyDays() {
    let date = new Date();
    date.setHours(0,0,0,0);
    date.setDate( date.getDate() - 30 );
    return date
}

module.exports = getLastThirtyDays