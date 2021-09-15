export async function run (client, message, settings) {

    if (!settings.raid_protection)
        return

    const rows = await client.database.query(`
        SELECT *
        FROM channels
        WHERE id = '${message.channel.id}'
    `)

    if (!rows?.at())
        await client.database.query(`
            INSERT INTO channels (id, cooldown)
            VALUES ('${message.channel.id}', '${message.channel.rateLimitPerUser}')
        `)

    const messagesInLastMinute = new Array(...message.channel.messages.cache.values())
        .filter(m => m.createdTimestamp/1000 >= Date.now()/1000-60).length

    const rate = [0, 10, 20, 30, 60, 120, 180, 300, 600]
        .reverse()
        .find(r => messagesInLastMinute >= r)

    if (rate > message.channel.rateLimitPerUser)
        message.channel.setRateLimitPerUser(rate, 'Protection anti-raid')

    else if (message.channel.rateLimitPerUser > rows?.at()?.cooldown && rate <= rows?.at()?.cooldown)
        message.channel.setRateLimitPerUser(rows?.at()?.cooldown, 'Protection anti-raid désactivée')
}