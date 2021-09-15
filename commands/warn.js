export default {
    description: 'Avertir un utilisateur',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre que vous souhaitez avertir',
            required: true
        }, {
            name: 'reason',
            type: 'STRING',
            description: 'Raison de l\'avertissement'
        }
    ],
    requirements: {
        moderatorOnly: true
    },
    rightClickSupport: true,
    run: async (client, interaction, options) => {

        if (await isModerator(options.member))
            return 'Vous ne pouvez pas avertir un modérateur'

        await client.database.query(`
            INSERT INTO warns (user_id, guild_id, moderator_id, reason)
            VALUES ('${options.member.id}', '${interaction.guild.id}', '${interaction.user.id}', "${options.reason?.replace(/"/g, "''") || 'NA'}")
        `)

        return options.member.toString() + ' a été avertit avec succès'
    }
}