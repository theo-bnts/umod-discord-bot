import { MessageEmbed, Permissions } from 'discord.js'

export default async (client, interaction) => {

    if (!interaction.isCommand() && !interaction.isContextMenu()) return

    if (interaction.isContextMenu()) {
        const relativeCommand = client.commands.find(c => c.name === interaction.command.name)
        const usedOption = relativeCommand.options.find(o => o.required === true)
        interaction.options.data.at().name = usedOption.name
    }

    if (interaction.user.bot) return

    if (interaction.channel?.type !== 'GUILD_TEXT')
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor(client.config.colors.embeds)
                .setDescription('Les commandes ne peuvent être exécutées que dans des salons textuels')
            ]
        })

    const command = client.commands.get(interaction.commandName)

    if (!command)
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setDescription('Cette commande n\'est pas accessible')
            ]
        })

    if (command.requirements?.moderatorOnly && !await isModerator(interaction.member))
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setDescription('Vous ne pouvez pas éxécuter cette commande car vous ne possédez pas de rôle modérateur sur ce serveur')
            ]
        })

    if (command.requirements?.client && !interaction.channel.permissionsFor(interaction.guild.me).has(command.requirements.client))
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor(client.config.colors.embeds)
                .setDescription('Je n\'ai pas la permission d\'éxécuter cette commande dans ce salon')
                .setFooter('Permission(s) requise(s): ' + interaction.channel.permissionsFor(interaction.guild.me).missing(command.requirements.client).join(', '))
            ]
        })

    if (command.ephemeral)
        await interaction.deferReply({ ephemeral: true })
    else
        await interaction.deferReply()
    
    const options = {}
    for (const option of interaction.options.data)
        options[option.name] = option.channel || option.member || option.role || option.value
        
    command
        .run(client, interaction, options)
        .then(async callback => {

            var iterations = 0

            while (!interaction.deferred && !interaction.replied) {
                await new Promise(r => setTimeout(r, 500))

                iterations++
                if (iterations >= 10)
                    throw new Error('Interaction not deferred or replied')
            }

            if (!callback && !interaction.replied)
                interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.config.colors.embeds)
                            .setDescription('Cette commande n\'a retourné aucun résultat')
                    ]
                })

            else if (typeof callback === 'string')
                interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.config.colors.embeds)
                            .setDescription(callback)
                    ]
                })

            else interaction.editReply(callback)
        })
        .catch(e => {
            interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.config.colors.embeds)
                        .setDescription('Cette commande a retournée une erreur')
                        .setFooter('ERREUR: ' + e.message)
                ]
            })

            log('yellow', 'soft error', e.stack)
        })
}