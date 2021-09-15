import axios from 'axios'

export async function run (client, message, settings) {

    if (!settings.image_moderation || !settings.image_moderation_attributes || !settings.clarifai_api_key)
        return

    for (const url of message.internal.URLs) {

        try {

            const { data } = await axios({
                method: 'post',
                url: 'https://api.clarifai.com/v2/models/d16f390eb32cad478c7ae150069bd2c6/versions/aa8be956dbaa4b7a858826a84253cab9/outputs',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Key ${settings.clarifai_api_key}`
                },
                data: {
                    inputs: [{
                        data: { image: { url: url } }
                    }]
                }
            })
    
            if (data?.outputs?.at().data?.concepts?.length > 0)
                for (const concept of data.outputs.at().data.concepts) {
                    if (settings.image_moderation_attributes.split(',').includes(concept.name) && concept.value >= settings.image_moderation_percent / 100)
                        return processDeletion(message, `${concept.name} (${(concept.value * 100).toFixed(1)}%)`, settings.logs_channel, message.internal.URLs)
                }

        } catch (e) {}

    }
}