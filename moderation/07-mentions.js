export async function run (client, message, settings) {
    
    if (!message.content || !settings.mentions_moderation)
        return

    if (message.mentions.users.size + message.mentions.roles.size >= settings.mentions_moderation_count)
        return warn(message, 'nombreuses mentions', settings)

    if (!message.mentions.everyone && (message.content?.includes('@everyone') || message.content?.includes('@here')))
        return warn(message, 'mention(s) non-autorisée(s)', settings)
}