import { MessageEmbed, Formatters } from 'discord.js'

export default {
    description: 'Voir les avertissements d\'un utilisateur',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre sur lequel vous souhaitez avoir des informations',
            required: true
        }
    ],
    run: async (client, interaction, options) => {

        const warns = await client.database.query(`
            SELECT date, moderator_id, reason
            FROM warns
            WHERE user_id = '${options.member.id}'
            AND guild_id = '${interaction.guild.id}'
        `)

        return {
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .addFields(
                        { name: 'Umod', value: warns.filter(w => w.moderator_id === 'umod').length.toString(), inline: true },
                        { name: 'Manuels', value: warns.filter(w => !isNaN(w.moderator_id)).length.toString(), inline: true },
                        { name: 'Total', value: warns.length.toString(), inline: true },
                        { name: 'Derniers warns', value:
                            warns
                                .reverse()
                                .slice(0, 10)
                                .map(w => `${Formatters.time(w.date, 'R')} par ${interaction.guild.members.cache.get(w.moderator_id)?.toString() || capitalize(w.moderator_id)} ${w.reason ? 'pour **' + w.reason + '**' : ''}`)
                                .join('\n')
                            || 'NA'
                        }
                    )
                    .setFooter('Cible: ' + options.member.user.tag, options.member.user.avatarURL())
            ]
        }
    }
}