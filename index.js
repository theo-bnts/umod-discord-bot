import { Client, Intents } from 'discord.js'
import { readdirSync, readFileSync } from 'fs'
import { version } from'os'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

const eventDirectory = './events'
for (const eventFileName of readdirSync(eventDirectory)) {

    const { default: event } = await import(eventDirectory + '/' + eventFileName)
    client.on(eventFileName.split('.').at(), event.bind(null, client))
}

client.config = JSON.parse(readFileSync('./assets/config.json', 'utf8'))

if (version().toLowerCase().startsWith('w'))
    client.login(client.config.tokens.beta)
else
    client.login(client.config.tokens.public)