import { Permissions, Formatters, MessageEmbed } from 'discord.js'

export default {
    description: 'Informations sur un utilisateur',
    options: [
        {
            name: 'member',
            type: 'USER',
            description: 'Membre sur lequel vous souhaitez avoir des informations',
            required: true
        }
    ],
    requirements: {
        client: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS]
    },
    rightClickSupport: true,
    run: async (client, interaction, options) => {

        const emojis = {
            ONLINE: '842073169410261042',
            IDLE: '842073169400561744',
            DND: '842073169111810049',
            OFFLINE: '842073169384701952',
            DISCORD_EMPLOYEE: '842073282646900769',
            PARTNERED_SERVER_OWNER: '842073282999091210',
            HYPESQUAD_EVENTS: '842073282994896916',
            HOUSE_BRAVERY: '842073282970648626',
            HOUSE_BRILLIANCE: '842073283138682942',
            HOUSE_BALANCE: '842073283104997447',
            BUGHUNTER_LEVEL_1: '842073282672853034',
            BUGHUNTER_LEVEL_2: '842073282756870185',
            VERIFIED_BOT: '875521411609939999',
            EARLY_VERIFIED_BOT_DEVELOPER: '842080866246983732',
            EARLY_SUPPORTER: '842073282958065674',
            DISCORD_CERTIFIED_MODERATOR: '875517541026504745',
            NITRO: '842073283054272582',
            BOOSTER: '84208093798544180',
            TEAM_USER: '875521411609939999' //?
        }

        for (const key of Object.keys(emojis))
            emojis[key] = Formatters.formatEmoji(emojis[key])

        const warns = await client.database.query(`SELECT moderator_id FROM warns WHERE user_id = '${options.member.id}' AND guild_id = '${options.member.guild.id}'`)

        return {
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setThumbnail(options.member.user.avatarURL({ size: 4096 }))
                    .addFields(
                        { name: '\u200b', value: '`Profil`' },
                        { name: 'Badges', value: new Array(options.member.user.flags.toArray().map(f => emojis[f]), options.member.premiumSince ? [emojis.NITRO, emojis.BOOSTER] : '').flat().join(' ') || 'NA', inline: true },
                        { name: 'Statut', value: emojis[(options.member.presence?.status || 'offline').toUpperCase()], inline: true },
                        { name: 'Activités', value: options.member.presence?.activities.map(a => `${a.emoji?.name || ''} ${a.id?.toUpperCase() !== 'CUSTOM' ? a.type.charAt(0) + a.type.slice(1).toLowerCase() + ' ' + a.name : a.state || ''}`.trim()).join('; ') || 'NA', inline: true },

                        { name: '\u200b', value: '`Utilisateur`' },
                        { name: 'Surnom', value: options.member.nickname || 'NA', inline: true },
                        { name: 'Pseudo', value: options.member.user.tag, inline: true },
                        { name: 'Identifiant', value: options.member.user.id, inline: true },

                        { name: '\u200b', value: '`Rôles`' },
                        { name: 'Couleur', value: options.member.displayHexColor || 'NA', inline: true },
                        { name: 'Rôles', value: options.member.roles.cache.sort((a, b) => a.position - b.position).map(r => r.toString()).join(', '), inline: true },
                        
                        { name: '\u200b', value: '`Dates`' },
                        { name: 'Booster', value: options.member.premiumSince ? Formatters.time(options.member.premiumSince, 'R') : 'NA', inline: true },
                        { name: 'Serveur rejoint', value: Formatters.time(options.member.joinedAt, 'R'), inline: true },
                        { name: 'Compte créé', value: Formatters.time(options.member.user.createdAt, 'R'), inline: true },

                        { name: '\u200b', value: '`Avertissements`' },
                        { name: 'Umod', value: warns.filter(w => w.moderator_id === 'umod').length.toString(), inline: true },
                        { name: 'Manuels', value: warns.filter(w => !isNaN(w.moderator_id)).length.toString(), inline: true },

                        { name: '\u200b', value: '`Salons`' },
                        { name: 'Vocal connecté', value: options.member.voice?.channel?.toString() || 'NA', inline: true }
                    )
                    .setFooter('Cible: ' + options.member.user.tag, options.member.user.avatarURL())
            ]
        }
    }
}