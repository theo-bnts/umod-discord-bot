import axios from 'axios'
import { JSDOM } from 'jsdom'

export async function run (client, message, settings) {

    if (!settings.links_moderation)
        return

    for (const url of message.internal.URLs) {

        const req = await axios({
            method: 'get',
            url: url,
            timeout: 1000
        }).catch(() => {})

        const hostname = req?.request?.host || url.replace('http://', '').split(/\/|\?/).at()

        if (!settings.authorized_domains?.split(',').some(d => hostname.endsWith(d))) {

            if (settings.blocked_domains?.split(',').some(d => hostname.endsWith(d)))
                return warn(message, 'lien: bloqué', settings)


            if (req?.data) {

                const dom = new JSDOM(req.data)

                const meta = {
                    title: dom.window.document.title,
                    description: dom.window.document.querySelector('meta[name="description"]')?.content
                }

                const { data: stats } = await axios({
                    method: 'post',
                    url: 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze',
                    params: {
                        key: client.config.authentification.perspective.key
                    },
                    headers: { 'content-type': 'application/json' },
                    data: {
                        comment: {
                            text: Object.values(meta).join(' ')
                        },
                        requestedAttributes: {
                            SEXUALLY_EXPLICIT: {},
                            THREAT: {},
                            IDENTITY_ATTACK: {},
                            PROFANITY: {}
                        },
                        languages: ['en']
                    }
                })

                const attributes = Object
                    .entries(stats.attributeScores)
                    .map(a => { return { name: a.at(), probability: a[1].summaryScore.value*100 } })
                    .sort((a, b) => b.probability - a.probability)
                    .map(a => {
                        a.probability = a.probability.toFixed(1)
                        return a
                    })

                if (attributes.at().probability >= settings.text_moderation_percent)
                    return warn(message, `lien: ${attributes.at().name} (${attributes.at().probability}%)`, settings)
            }


            const { data: analysis } = await axios({
                method: 'get',
                url: 'https://api.metadefender.com/v4/url/' + encodeURIComponent(url),
                headers: {
                    apiKey: settings.metadefender_api_key
                }
            })

            if (analysis.lookup_results.detected_by >= 1)
                return warn(message, 'lien: malicieux', settings)
        }
    }
}