import { Permissions, MessageEmbed } from 'discord.js'

export default async (client, guild) => {

    const rows = await client.database.query(`
        SELECT list
        FROM guilds
        WHERE id = '${guild.id}'
    `)
    
    if (rows.length === 0)
        await client.database.query(`
            INSERT INTO guilds (id)
            VALUES ('${guild.id}')
        `)

    await guild.members.fetch()

    const privilegiedMembers = new Array(...guild.members.cache.values())
        .filter(m => m.permissions.has(Permissions.FLAGS.MANAGE_GUILD))

    for (const member of privilegiedMembers) {
        member.send({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.embeds)
                    .setTitle(`Merci d'avoir ajouté ${client.user.username} !`)
                    .setDescription(client.user.username + ' protège déjà votre serveur !\nPour terminer la configuration, exécutez la commande `/setup` dans un salon.')
                    .setFooter('Vous recevez ce message car vous avez la permission Gérer le serveur sur ' + guild.name)
            ]
        })
            .catch(() => {})
    }
}