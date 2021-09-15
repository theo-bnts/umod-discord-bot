import { Permissions } from 'discord.js'

export default {
    description: 'Expulser un membre',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre à expulser',
            required: true
        }, {
            name: 'reason',
            type: 'STRING',
            description: 'Raison de l\'expulsion'
        }
    ],
    requirements: {
        moderatorOnly: true,
        client: [Permissions.FLAGS.KICK_MEMBERS]
    },
    rightClickSupport: true,
    run: async (client, interaction, options) => {

        return 'Commande désactivée pour des tests de sécurité'

        if (await isModerator(options.member))
            return 'Vous ne pouvez pas expulser un modérateur'
        
        if (options.member.kickable)
            return 'Je ne peux pas expulser ce membre'

        options.member.kick({ reason: options.reason })

        return options.member.user.tag + ' a été expulsé'
    }
}