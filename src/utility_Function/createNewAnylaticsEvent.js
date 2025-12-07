const { Anylatics } = require('../models/Analytics');

function createAnylaticsEvent(eventData) {
    
    if (!eventData) return;

    setImmediate(async () => {
        try {
            let newEvent = new Anylatics(eventData);
            let savedEvent = await newEvent.save();
            console.log(savedEvent)
        } catch (error) {
            console.log('Anylatics event save =>' + error.message)
        }

    })

}

module.exports = { createAnylaticsEvent }