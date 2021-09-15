const { default: asdfjkl } = await import('asdfjkl')
const { default: isGibberish } = asdfjkl

import { Util } from 'discord.js'

export async function run (client, message, settings) {

    if (!settings.spam_moderation)
        return

    for (var segment of message.internal.segments) {

        segment = Util.cleanContent(segment, message.channel)

        const splitedSegmentArray = segment.split(/[^a-z]/gi)

        for (const splitedSegment of splitedSegmentArray) {

            var count = 0

            if (splitedSegment.length >= 5 && isGibberish(splitedSegment))
                count++

            if (count >= splitedSegmentArray.length / 2.5)
                return processDeletion(message, 'spam')

        }
    }

}