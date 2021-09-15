const moderationIndex = await import('../moderation/00-index.js')

export default async (client, message) => {

    if (message.partial)
        message = await message.fetch()

    moderationIndex.run(client, message)
}