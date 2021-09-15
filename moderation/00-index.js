import { readdirSync } from 'fs'
import { Permissions, MessageEmbed } from 'discord.js'

export async function run (client, message) {

    if (message.author.bot)
        return

    if (message.channel.type === 'DM')
        return

    const missingPermissions = message.channel.permissionsFor(message.guild.me).missing([
        Permissions.FLAGS.VIEW_CHANNEL,
        Permissions.FLAGS.READ_MESSAGE_HISTORY,
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.EMBED_LINKS,
        Permissions.FLAGS.MANAGE_MESSAGES,
        Permissions.FLAGS.MANAGE_CHANNELS,
        Permissions.FLAGS.VIEW_AUDIT_LOG
    ])

    if (missingPermissions.length > 0)
        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setDescription('**L\'auto-modérateur manque de permisions pour fonctionner dans ce channel.**\n\n' + missingPermissions.map(p => '❌ `' + p + '`').join('\n'))
                    .setFooter('Pour arrêter de voir ce message, ajouter-moi les permmissions précédentes ou supprimer moi la permission de lire les messages dans ce salon')
            ]
        })
            .catch(() => {})

    
    if (!await isModerator(message.member)) {

        const settings = await client.database.query(`
            SELECT *
            FROM guilds
            WHERE id = '${message.guild.id}'
        `)

        for (const fileName of readdirSync('moderation').splice(1)) {

            const file = await import('../moderation/' + fileName)
            
            await file
                .run(client, message, settings.at())
                .catch((e) => log('yellow', 'soft error', e.stack))
                
            if (message.processDeletionAttempt || message.deleted)
                return
        }

    }
}