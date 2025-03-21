
const fs = require('node:fs');
const path = require('node:path');

module.exports = {

    loadEvents: async function (client) {
        // Load all events
        const eventsPath = path.join(__dirname, '..', 'events');
        console.log(`[INFO] Loading events from ${eventsPath}`);
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if ('name' in event && 'execute' in event) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            } else {
                console.log(`[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`);
            }
        }
        console.log(`[INFO] Loaded ${eventFiles.length} events.`);
    }
};