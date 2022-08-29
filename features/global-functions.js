import { MessageEmbed, Util, Formatters, Permissions } from 'discord.js'
import chalk from 'chalk'

export default async (client) => {

    global.capitalize = (string) => {

        if (string.length <= 1)
            return string
                .toUpperCase()

        else if (!string.includes(': '))
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

        else
            return string
                .split(': ')
                .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
                .join(': ')
    }

    global.crop = (string, max) => {

        if (string.length > max)
            return string.slice(0, max - 4) + ' ...'
        else
            return string
    }

    global.datePlusDays = (days) => {

        var result = new Date()
        result.setDate(result.getDate() + days)
        return result
    }

    global.log = (color, title, message) => {

        console[title.match(/error/i) ? 'error' : 'log']
            (
                chalk.black['bg' + capitalize(color)](title?.toUpperCase()) + 
                (message.includes('\n') ? '\n' : ' ') +
                chalk[color.toLowerCase()](message)
            )
    }

    global.formatMatches = (matchs) => {
        
        return new Array(...matchs)
            .map(match => {
                return new Object({
                    content: match.at(),
                    start: match.index,
                    end: match.index + match.at().length
                })
            })
            .filter(match => match.content.length > 0)
    }

    global.recursiveReplace = (string, regexs, replacer = '') => {

        for (const regex of regexs)
            while (string.match(regex) !== null)
                string = string.replace(regex, replacer)

        return string
    }

    global.cleanContent = (content, channel) => {

        if (channel)
            return Util.cleanContent(content, channel)
        else
            return content
    }


    global.isModerator = async (member) => {

        const [row] = await client.database.query(`
            SELECT moderator_role
            FROM guilds
            WHERE id = '${member.guild.id}'
        `)

        return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (row.moderator_role && member.roles.cache.has(row.moderator_role))
    }

    global.guildLog = async (params) => {

        const [row] = await client.database.query(`
            SELECT logs_channel
            FROM guilds
            WHERE id = '${params.guild.id}'
        `)

        const logsChannel = params.guild.channels.cache.get(row.logs_channel)

        if (!logsChannel)
            return

        const embed = new MessageEmbed()
            .setColor(client.config.colors.embeds)
            .setTimestamp()

        if (params.type) embed.addField('Type', params.type)
        if (params.reason) embed.addField('Raison', params.reason)
        if (params.user) embed.addField('Utilisateur', `Mention: ${params.user}\nTag: ${params.user.tag}\nID: ${params.user.id}`)
        if (params.moderator) embed.addField('Modérateur', typeof params.moderator === 'string' ? params.moderator : `${params.moderator.probability ? 'Probabilité: ' + params.moderator.probability + '%' : ''}\nMention: ${params.moderator}\nTag: ${params.moderator.tag}\nID: ${params.moderator.id}`)
        if (params.channel) embed.addField('Salon', params.channel.toString())
        if (params.footer) embed.setFooter(params.footer)

        if (logsChannel.nsfw) {
            if (params.message?.content) embed.addField('Message', Formatters.codeBlock(crop(cleanContent(params.message.content, params.message.channel), 1000)))
            if (params.message?.attachments?.length > 0) embed.addField('Attachements', Formatters.codeBlock(params.message.attachments.map(a => `[${a.name}](${a.url})`).join('\n---\n'), 1000))
            if (params.messagesLink) embed.addField('Messages', `[Voir en ligne](${params.messagesLink})\n*Suppression ${Formatters.time(datePlusDays(90), 'R')}*`)
        } else
            embed.addField('Information', 'Pour voir l\'intégralité des logs, veuillez [définir ce salon en tant que "NSFW"](https://support.discord.com/hc/fr/articles/115000084051-NSFW-Channels-and-Content#h_adc93a2c-8fc3-4775-be02-bbdbfcde5010).')

        logsChannel.send({embeds: [embed]})
            .catch(() => {})
    }

    global.warn = async (message, reason, settings) => {

        if (!message.deletable || message.deleted || message.warnAttempt)
            return
        
        message.warnAttempt = true

        reason = capitalize(
            reason
                .replace(/_EXPERIMENTAL/g, '')
                .replace(/_/g, ' ')
        )

        try {
            message.delete()

            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.config.colors.embeds)
                        .setAuthor('Sécurité ' + client.user.username, null, 'https://fortool.fr/umod/invite')
                        .setDescription('Votre message semblait ne pas être en adéquation avec le règlement de ce serveur.')
                        .setFooter(`Cible: ${message.author.username} • Raison: ${reason}`, message.author.avatarURL())
                ]
            })
                .then(m => setTimeout(() => m.delete(), 15000))

            if (settings.timeout && settings.timeout_seconds > 0) {
                message.member.timeout(settings.timeout_seconds * 1000, reason)
            }
        } catch (e) {}

        await client.database.query(`
            INSERT INTO warns (user_id, guild_id, moderator_id, reason)
            VALUES ('${message.author.id}', '${message.guild.id}', 'umod', '${reason}')
        `)

        const [row] = await client.database.query(`
            SELECT *
            FROM warns
            ORDER BY list
            DESC LIMIT 1
        `)

        const warnsCount = row.list
        
        guildLog({
            guild: message.guild,
            type: 'Suppression et (*soft*) avertissement',
            reason: reason,
            user: message.author,
            moderator: client.user.username,
            channel: message.channel,
            message: message,
            footer: 'ID: '+ warnsCount
        })
    }
}