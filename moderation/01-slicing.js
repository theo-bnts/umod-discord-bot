import { findLinks } from 'links-finder'
import axios from 'axios'
import pixels from 'image-pixels'
import jsqr from 'jsqr'

export async function run (client, message, settings) {

    const objet = {
        segments: [],
        URLs: []
    }



    /// SEGMENTS
    if (message.content) objet.segments.push(message.content)

    for (const embed of message.embeds) {
        if (embed.author?.name) objet.segments.push(embed.author.name)
        if (embed.title) objet.segments.push(embed.title)
        if (embed.description) objet.segments.push(embed.description)

        for (const field of embed.fields) {
            if (field.name) objet.segments.push(field.name)
            if (field.value) objet.segments.push(field.value)
        }

        if (embed.footer?.text) objet.segments.push(embed.footer.text)
    }

    objet.segments = [...new Set(objet.segments)]


    
    /// ATTACHMENTS
    if ([...message.attachments.values()].length > 0) objet.URLs.push(...message.attachments.map(a => a.url))

    for (const embed of message.embeds) {
        if (embed.author?.iconURL) objet.URLs.push(embed.author.iconURL)
        if (embed.author?.url) objet.URLs.push(embed.author.url)
        if (embed.files?.length > 0) objet.URLs.push(...embed.files.map(f => f.url))
        if (embed.image?.url) objet.URLs.push(embed.image.url)
        if (embed.thumbnail?.url) objet.URLs.push(embed.thumbnail.url)
        if (embed.url) objet.URLs.push(embed.url)
        if (embed.video?.url) objet.URLs.push(embed.video.url)
    }

    for (const segment of objet.segments)
        for (const linkPosition of findLinks(segment))
            objet.URLs.push(segment.slice(linkPosition.start, linkPosition.end + 1))
    
    normalizeURLs()
    
    for (const url of [...new Set(objet.URLs)]) {

        try {
            const { headers } = await axios({
                method: 'head',
                url: url,
                timeout: 1000
            })

            if (headers['content-type']?.startsWith('image')) {
                const { data: imgData, width: imgWidth, height: imgHeight } = await pixels(url)
                const { data: qrData } = await jsqr(imgData, imgWidth, imgHeight)

                objet.segments.push(qrData)

                for (const linkPosition of findLinks(qrData)) 
                    objet.URLs.push(qrData.slice(linkPosition.start, linkPosition.end + 1))
            }

        } catch (e) {}
    }

    normalizeURLs()



    message.internal = objet



    function normalizeURLs () {
        for (const i in objet.URLs) {

            if (objet.URLs[i].startsWith('http://'))
                objet.URLs[i] = objet.URLs[i].replace('http://', '')
    
            if (objet.URLs[i].startsWith('https://'))
                objet.URLs[i] = objet.URLs[i].replace('https://', '')
            
            objet.URLs[i] = 'http://' + objet.URLs[i]
    
            if (objet.URLs[i].endsWith('/'))
                objet.URLs[i] = objet.URLs[i].slice(0, -1)
        }

        objet.URLs = [...new Set(objet.URLs)]
    }
}