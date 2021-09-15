import { GuildAuditLogs } from 'discord.js'

export default async (client, message) => {
    /// EFFECTUER UNE ACTION AVEC LE BOT QUI SERA LOG
    /// AINSI, SI LA DERNIERE ENTREE DES LOGS ET UN MESSAGE_DELETE AU MOMENT OU L'EVENT EST EMIT
    /// ALORS ELLE CORRESPOND FORCEMENT AU DERNIER MESSAGE SUPPRIME

    if (message.partial) return

    var moderator = false

    const entry = await message.guild.fetchAuditLogs({ type: GuildAuditLogs.Actions.MESSAGE_DELETE, limit: 1 })
        .then(audit => audit.entries.first())

    if (!entry)
        return

    if (entry.extra.channel.id === message.channel.id
    && (entry.target.id === message.author.id)
    && (entry.createdTimestamp > (Date.now() - 60 * 1000))) {
        moderator = entry.executor
    }

    if (!moderator)
        return

    moderator.probability = Math.round(((60 * 1000 - (Date.now() - entry.createdTimestamp)) / 1200 + 50) * 100) / 100

    if (moderator)
        guildLog({
            guild: message.guild,
            type: 'Suppression',
            user: message.author,
            moderator: moderator,
            channel: message.channel,
            message: message
        })
}