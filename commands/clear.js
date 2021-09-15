import { Permissions } from 'discord.js'

export default {
    description: 'Supprimer des messages',
    options: [
        {
            name: 'amount',
            type: 'INTEGER',
            description: 'Nombre de messages à supprimer',
            required: true
        }, {
            name: 'member',
            type: 'USER',
            description: 'Autheur des messages à supprimer'
        }
    ],
    requirements: {
        moderatorOnly: true,
        client: [Permissions.FLAGS.MANAGE_MESSAGES]
    },
    run: async (client, interaction, options) => {

        if (options.amount > 100)
            return 'Vous ne pouvez supprimer que jusqu\'à 100 messages'

        var messagesToDelete

        if (!options.member)
            messagesToDelete = await interaction.channel.messages.fetch({ limit: options.amount, before: interaction.id })
        else {
            await interaction.channel.messages.fetch({ limit: 100, before: interaction.id })

            messagesToDelete = new Array(...interaction.channel.messages.cache.values())
                .filter(m => m.author.id === options.member.id)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .slice(-options.amount)
        }

        const deletedMessages = await interaction.channel.bulkDelete(
            messagesToDelete
                .filter(m => m.createdTimestamp > Date.now() - (14 * 24 * 60 * 60 * 1000))
        )

        for (const deletedMessage of new Array(...deletedMessages.values()))
            deletedMessage.internal = {
                deletedBy: interaction.user
            }
    
        return deletedMessages.size + ' message(s) supprimé(s)'
    }
}