export async function run (client, message, settings) {
    
    if (!message.content || !settings.mentions_moderation)
        return

    if (message.mentions.users.size + message.mentions.roles.size >= settings.mentions_moderation_count)
        return processDeletion(message, 'nombreuses mentions')
}