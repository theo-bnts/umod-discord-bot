import languageDetector from 'languagedetect'
import axios from 'axios'

export async function run (client, message, settings) {

    if (!settings.text_moderation)
        return

    for (const segment of message.internal.segments) {

        // https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages

        const attributes = {
            TOXICITY: ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru'],
            TOXICITY_EXPERIMENTAL: ['ar'],
            SEVERE_TOXICITY: ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru'],
            SEVERE_TOXICITY_EXPERIMENTAL: ['ar'],
            IDENTITY_ATTACK: ['de', 'it', 'pt', 'ru', 'en'],
            IDENTITY_ATTACK_EXPERIMENTAL: ['fr', 'es', 'ar'],
            INSULT: ['de', 'it', 'pt', 'ru', 'en'],
            INSULT_EXPERIMENTAL: ['fr', 'es', 'ar'],
            PROFANITY: ['de', 'it', 'pt', 'ru', 'en'],
            PROFANITY_EXPERIMENTAL: ['fr', 'es', 'ar'],
            THREAT: ['de', 'it', 'pt', 'ru', 'en'],
            THREAT_EXPERIMENTAL: ['fr', 'es', 'ar'],
            SEXUALLY_EXPLICIT: ['en'],
            FLIRTATION: ['en']
        }

        const languages = new languageDetector()
        languages.setLanguageType('iso2')

        const languageConfidences = Object.fromEntries(languages.detect(segment))

        var language = 'fr'

        for (const key of Object.keys(languageConfidences))
            if (
                Object
                    .values(attributes)
                    .flat()
                    .includes(key)
                &&
                languageConfidences[key] > 0.5
            )
                language = key

        const requestedAttributes = Object.keys(attributes)
            .filter(key => attributes[key].includes(language))
            .reduce((a, b) => ({...a, [b]: {}}), {})

        const { data: stats } = await axios({
            method: 'post',
            url: 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze',
            params: {
                key: client.config.authentification.perspective.key
            },
            headers: {
                'content-type': 'application/json'
            },
            data: {
                comment: { text: segment },
                requestedAttributes: requestedAttributes,
                languages: [language]
            }
        })

        const scores = Object
            .entries(stats.attributeScores)
            .map(a => { return { name: a.at(0), probability: a.at(1).summaryScore.value*100 } })
            .sort((a, b) => b.probability - a.probability)
            .map(a => {
                a.probability = a.probability.toFixed(1)
                return a
            })

        if (scores.at().probability >= settings.text_moderation_percent)
            return processDeletion(message, `${scores.at().name} (${scores.at().probability}%)`)
    }
}