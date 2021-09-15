const moderationIndex = await import('../moderation/00-index.js')

export default async (client, message) => {
    moderationIndex.run(client, message)
}