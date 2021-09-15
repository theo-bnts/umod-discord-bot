export async function run (client, message, settings) {
    
    if (!message.content || !settings.emoji_moderation || !settings.emoji_moderation_count)
        return

    var emojiCount = 0

    const unicodeRedex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug
    const discordRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g

    emojiCount += (message.content.match(unicodeRedex) || []).length
    emojiCount += (message.content.match(discordRegex) || []).length

    if (emojiCount >= settings.emoji_moderation_count)
        return processDeletion(message, 'nombreux emojis')
}