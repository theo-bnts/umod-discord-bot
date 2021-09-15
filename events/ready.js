import { readdirSync } from 'fs'
import { Collection } from 'discord.js'
import pmysql from 'promise-mysql'

export default async (client) => {

    setInterval(async () => {
        try {
            await client.database.ping()
        } catch (e) {
            try {
                client.database = await pmysql.createConnection(client.config.mysql)
                log('blue', 'event', 'Database reconnected !')
            } catch (e) {
                log('yellow', 'soft error', e.stack)
            }
        }
    }, 500)

    setInterval(() => {
        try {
            client.user.setPresence({
                activities: [{
                    type: 'WATCHING',
                    name: new Array(...client.guilds.cache).length + ' servers'
                }]
            })
        } catch (e) {}
    }, 60 * 1000)

    const featuresDirectory = process.cwd() + '/features'

    for (const featureFileName of readdirSync(featuresDirectory)) {
        const { default: feature } = await import('file:///' + featuresDirectory + '/' + featureFileName)

        const timestamp = Date.now()
        client.on(timestamp, feature.bind(null, client))
        client.emit(timestamp)
    }

    log('blue', 'event', 'Features emited !')

    const commandsDirectory = process.cwd() + '/commands'
    client.commands = new Collection()
    
    for (const commandFileName of readdirSync(commandsDirectory)) {
        const { default: command } = Object.assign({}, await import('file:///' + commandsDirectory + '/' + commandFileName))

        command.name = commandFileName.split('.').at()

        var contextMenu = false

        if (command.rightClickSupport) {
            contextMenu = {...command}
            contextMenu.type = 'USER'
            contextMenu.description = undefined
            contextMenu.options = undefined
        }

        client.commands.set(command.name, command)

        if (command.guilds?.length > 0)
            for (const guild of command.guilds) {

                client.guilds.cache.get(guild)?.commands.create(command)

                if (contextMenu)
                    client.guilds.cache.get(guild)?.commands.create(contextMenu)
            }
        else {
            client.application.commands.create(command)

            if (contextMenu)
                client.application.commands.create(contextMenu)
        }
    }

    await client.application.commands.fetch()

    for (const command of client.application.commands.cache.values())
        if (!client.commands.some(c => c.name === command.name && !c.guilds))
            client.application.commands.delete(command)
    
    for (const guild of client.guilds.cache.values()) {
        await guild.commands.fetch()

        for (const command of guild.commands.cache.values())
            if (!client.commands.some(c => c.name === command.name && c.guilds?.includes(guild.id)))
                guild.commands.delete(command)
    }
    
    log('blue', 'event', 'Commands updated !')

    log('green', 'ready', client.user.username + ' is ready !')
}