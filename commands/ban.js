import { Permissions } from 'discord.js'

export default {
    description: 'Bannir un membre',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre à bannir',
            required: true
        }, {
            name: 'reason',
            type: 'STRING',
            description: 'Raison du bannissement'
        }
    ],
    requirements: {
        moderatorOnly: true,
        client: [Permissions.FLAGS.BAN_MEMBERS]
    },
    rightClickSupport: true,
    run: async (client, interaction, options) => {
        
        return 'Commande désactivée pour des tests de sécurité'

        if (await isModerator(options.member))
            return 'Vous ne pouvez pas bannir un modérateur'
        
        if (options.member.bannable)
            return 'Je ne peux pas bannir ce membre'

        options.member.ban({ reason: options.reason })

        return options.member.user.tag + ' a été banni'
    }
}