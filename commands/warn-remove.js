import { MessageEmbed, MessageActionRow, MessageSelectMenu, Formatters, Util } from 'discord.js'
import formatDuration from 'humanize-duration'

export default {
    description: 'Retirer un avertissement d\'un utilisateur',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre dont vous un avertissement à supprimer',
            required: true
        }
    ],
    requirements: {
        moderatorOnly: true
    },
    run: async (client, interaction, options) => {

        const warns = await client.database.query(`
            SELECT list, date, moderator_id, reason
            FROM warns
            WHERE user_id = '${options.member.id}'
            AND guild_id = '${interaction.guild.id}'
        `)

        if (warns.length === 0)
            return options.member.toString() + ' n\'a aucun avertissement'

        const reply = await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setDescription('Choisis le ou les avertissements à supprimer dans le menu de selection ci-après')
                    .setFooter('Cible: ' + options.member.user.tag, options.member.user.avatarURL())
            ],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('warn-remove-select-menu')
                            .setMaxValues(warns.slice(0, 25).length)
                            .addOptions(
                                warns
                                    .reverse()
                                    .slice(0, 25)
                                    .map(w => {
                                        return new Object({
                                            value: w.list.toString(),
                                            label: `${w.list.toString()}${w.reason ? ' - ' + w.reason : ''}`,
                                            description: `Il y a ${formatDuration(new Date() - w.date, { language: 'fr', largest: 1, round: true })} par ${interaction.guild.members.cache.get(w.moderator_id)?.user.tag || capitalize(w.moderator_id)}`
                                        })
                                    })
                            )
                    )
            ]
        })

        const filter = (i) => i.customId === 'warn-remove-select-menu' && i.user.id === interaction.user.id

        reply.awaitMessageComponent({ filter })
            .then(async i => {
                
                for (const value of i.values)
                    await client.database.query(`
                        DELETE FROM warns
                        WHERE list = ${value}
                    `)

                interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.config.colors.embeds)
                            .setDescription(`Les avertissements sélectionnés (${i.values.reverse().join(', ')}) ont bien été supprimés`)
                            .setFooter('Cible: ' + options.member.user.tag, options.member.user.avatarURL())
                    ],
                    components: []
                })
            })

    }
}