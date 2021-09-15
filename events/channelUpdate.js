export default async (client, oldChannel, newChannel) => {

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {

        const entry = await newChannel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first())

        if (
            entry?.target.id === newChannel.id
            && entry.changes.some(c => c.key === 'rate_limit_per_user')
            && entry.changes.find(c => c.key === 'rate_limit_per_user').old === oldChannel.rateLimitPerUser
            && entry.changes.find(c => c.key === 'rate_limit_per_user').new === newChannel.rateLimitPerUser
            && entry.executor.id !== client.user.id
        ) {

            const rows = await client.database.query(`SELECT * FROM channels WHERE id = '${newChannel.id}'`)

            if (rows?.at())
                await client.database.query(`UPDATE channels SET cooldown = '${newChannel.rateLimitPerUser}' WHERE id = '${newChannel.id}'`)
        }
    }
}