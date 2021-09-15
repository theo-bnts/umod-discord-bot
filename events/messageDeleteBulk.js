import { readFileSync } from 'fs'
import FormData from 'form-data'
import axios from 'axios'
import { GuildAuditLogs } from 'discord.js'

export default async (client, messages) => {

    messages = new Array(...messages.values())
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

    const fileBuffer = Buffer.from(
        recursiveReplace(
            container('base',
                element('preambule', messages.at().channel),
                container('chat',
                    messages.map(m =>
                        container('group-messages',
                            element('avatar', m.author) + '\n' +
                            container('message-box',
                                element('username', m),
                                element('timestamp', m.createdTimestamp),
                                container('message',
                                    element('message-content', m.content),
                                    m.attachments?.map(a =>
                                        container('attachment',
                                            a.contentType?.startsWith('image') ? element('image', a.url) : '',
                                            a.contentType?.startsWith('video') ? element('video', a.url) : ''
                                        )
                                    ),
                                    m.embeds?.map(e => element('embed', e))
                                )
                            )
                        )
                    )
                )
            ),
            [
                /<.*=\s*"(undefined|null)".*>/g,
                /<(\w+)[^<>#\/]*>(\s|undefined|null)*<\/\1>/g,
                /^\s+\n/gm,
                /  /g
            ]
        )
    )

    const formData = new FormData()
    formData.append('file', fileBuffer, { filename: Date.now() + '.html' })

    const { data: host } = await axios({
        method: 'post',
        url: 'https://siasky.net/skynet/skyfile',
        headers: { ...formData.getHeaders() },
        data: formData
    })

    const { data: shortener } = await axios({
        method: 'post',
        url: 'https://u-short.cf/DP8EJSIIY8ULSV9NC130',
        data: {
            shortCode: Math.random().toString(36).slice(7),
            target: 'https://siasky.net/' + host.skylink
        }
    })

    console.log(shortener)

    if (messages.some(m => m.author?.bot === false)) {

        const entry = await messages.at().guild.fetchAuditLogs({ type: GuildAuditLogs.Actions.MESSAGE_BULK_DELETE, limit: 1 })
            .then(audit => audit.entries.first())

        const { executor: moderator } = entry

        guildLog({
            guild: messages.at().guild,
            type: 'Suppressions multiples',
            moderator: messages.at().internal?.deletedBy || moderator,
            channel: messages.at().channel,
            messagesLink: shortener.data.shortUrl
        })
    }
}

function container(name, ...elements){
    return readFileSync('./assets/messages-viewer/containers/' + name + '.js.html', 'utf-8')
        .replace('{ELEMENTS}', elements.flat().join('\n'))
}

function element(name, P) {
    const evalRegex = /\${[^}]+}/g

    var text = readFileSync('./assets/messages-viewer/elements/' + name + '.js.html', 'utf-8')

    for (const match of text.match(evalRegex) || [])
        try {
            text = text.replace(match, eval(match.match(/[^${}]+/).at()))
        } catch (e) {}
        
    return text
}