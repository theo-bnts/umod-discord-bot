export default {
    description: 'Configuration de votre serveur',
    options: [
        {
            name: 'clarifai-key',
            type: 'STRING',
            description: 'Clé d\'API Clarifai (pour la modération des images)'
        }, {
            name: 'metadefender-key',
            type: 'STRING',
            description: 'Clé d\'API MetaDefender (pour la modération des liens & virus)'
        }, {
            name: 'moderator-role',
            type: 'ROLE',
            description: 'Les membres possédant ce rôle seront immunisés contre les actions de modération'
        }, {
            name: 'logs-channel',
            type: 'CHANNEL',
            description: 'Ce salon recevra les logs de modération'
        }
    ],
    ephemeral: true,
    requirements: {
        moderatorOnly: true
    },
    run: async (client, interaction, options) => {

        const replies = new Array()



        if (options['clarifai-key']?.match(/[a-z0-9]{32}/)) {

            await client.database.query(`
                UPDATE guilds
                SET clarifai_api_key = '${options['clarifai-key']}'
                WHERE id = '${interaction.guild.id}'
            `)

            replies.push('`' + options['clarifai-key'] + '` à bien enregistrée en tant que clé pour la modération des images')

        } else if (options['clarifai-key']) {

            replies.push('`' + options['clarifai-key'] + '` n\'est pas une clé Clarifai valide\n[Tutoriel](https://medium.com/@theo_bnts/cr%C3%A9er-une-cl%C3%A9-dapi-clarifai-5c1f9eda72f7)')

        } else {

            const rows = await client.database.query(`
                SELECT clarifai_api_key
                FROM guilds
                WHERE id = '${interaction.guild.id}'
            `)

            if (!rows.at().clarifai_api_key)
                replies.push('Pensez à ajouter une clé Clarifai afin de pouvoir utiliser la modération d\'images.\n[Tutoriel](https://medium.com/@theo_bnts/cr%C3%A9er-une-cl%C3%A9-dapi-clarifai-5c1f9eda72f7)')
        
        }



        if (options['metadefender-key']?.match(/[a-z0-9]{32}/)) {

            await client.database.query(`
                UPDATE guilds
                SET metadefender_api_key = '${options['metadefender-key']}'
                WHERE id = '${interaction.guild.id}'
            `)

            replies.push('`' + options['metadefender-key'] + '` à bien enregistrée en tant que clé pour la modération des liens & virus')

        } else if (options['metadefender-key']) {

            replies.push('`' + options['metadefender-key'] + '` n\'est pas une clé MetaDefender valide\n[Tutoriel](https://medium.com/@theo_bnts/cr%C3%A9er-une-cl%C3%A9-dapi-metadefender-c8b81da1874f)')

        } else {

            const rows = await client.database.query(`
                SELECT metadefender_api_key
                FROM guilds
                WHERE id = '${interaction.guild.id}'
            `)

            if (!rows.at().metadefender_api_key)
                replies.push('Pensez à ajouter une clé Metadefender afin de pouvoir utiliser la modération de liens & virus.\n[Tutoriel](https://medium.com/@theo_bnts/cr%C3%A9er-une-cl%C3%A9-dapi-metadefender-c8b81da1874f)')
        
        }


        
        if (options['moderator-role']) {

            await client.database.query(`
                UPDATE guilds
                SET moderator_role = '${options['moderator-role'].id}'
                WHERE id = '${interaction.guild.id}'
            `)

            replies.push(options['moderator-role'].toString() + ' a bien été enregistré en tant que rôle de modérateurs.')

        } else {

            const rows = await client.database.query(`
                SELECT moderator_role
                FROM guilds
                WHERE id = '${interaction.guild.id}'
            `)

            if (!rows.at().moderator_role)
                replies.push('Pensez à enregistrer un rôle de modérateurs.')

        }



        if (options['logs-channel']?.type === 'GUILD_TEXT') {

            await client.database.query(`
                UPDATE guilds
                SET logs_channel = '${options['logs-channel'].id}'
                WHERE id = '${interaction.guild.id}'
            `)

            replies.push(options['logs-channel'].toString() + ' a bien été enregistré en tant que salon de logs.')

        } else if (options['logs-channel']) {

            replies.push(options['logs-channel'].toString() + ' n\'est pas un salon textuel.')

        } else {

            const rows = await client.database.query(`
                SELECT logs_channel
                FROM guilds
                WHERE id = '${interaction.guild.id}'
            `)

            if (!rows.at().logs_channel)
                replies.push('Pensez à enregistrer un salon de logs.')

        }



        if (replies.length === 0)
            replies.push('Tout est en ordre ! Rien n\'a changé depuis la dernière éxécution de la commande !')



        return replies.join('\n\n')
    }
}