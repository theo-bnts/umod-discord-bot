export async function run (client, message, settings) {
    
    if (!settings.duplicated_moderation)
        return
        
    const precedentMessages = await message.channel.messages.fetch({ limit: 3, before: message.id })
    
    const messages = new Array(...precedentMessages.values())
        .filter(m => m.author?.id !== client.user?.id && !m.deleted)
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

    if (
        message.content === messages.at(-1)?.content
        && message.attachments.map(a => a.size).reduce((a, b) => a + b, 0) === messages.at(-1)?.attachments?.map(a => a.size).reduce((a, b) => a + b, 0)
        && message.author?.id === messages.at(-1)?.author?.id
    )
        return processDeletion(message, 'message dupliqué')
}   