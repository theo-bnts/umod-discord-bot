import { Permissions, MessageActionRow, MessageButton } from 'discord.js'

export default {
    description: 'Inviter le robot sur votre serveur',
    run: async (client, interaction, options) => {

        /*
        const invite = client.generateInvite({
            scopes: ['bot', 'applications.commands'],
            permissions: [
                Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.READ_MESSAGE_HISTORY,
                Permissions.FLAGS.SEND_MESSAGES,
                Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
                Permissions.FLAGS.EMBED_LINKS,
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
                Permissions.FLAGS.VIEW_AUDIT_LOG
            ]
        })
        */

        return {
            content: '⤵️',
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setStyle('LINK')
                            .setLabel('Invite-moi')
                            .setURL('https://fortool.fr/umod/invite')
                    )
            ]
        }
    }
}