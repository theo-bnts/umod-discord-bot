import axios from'axios'
import Hasher from'sha.js'

export async function run (client, message, settings) {

    if (!settings.virus_moderation)
        return

    for (const url of message.internal.URLs) {

        var req = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        }).catch(() => {})

        if (req?.data) {

            const { data: fileBuffer } = req

            const hash = Hasher('sha256')
                .update(fileBuffer)
                .digest('hex')

            req = await axios({
                method: 'get',
                url: 'https://api.metadefender.com/v4/hash/' + hash,
                headers: {
                    apiKey: settings.metadefender_api_key
                }
            }).catch(() => {})

            if (req?.data)
                var { data: analysis } = req

            if (!analysis?.scan_results) {

                const { data: upload } = await axios({
                    method: 'post',
                    url: 'https://api.metadefender.com/v4/file',
                    headers: {
                        apiKey: settings.metadefender_api_key,
                        'content-type': 'application/octet-stream'
                    },
                    data: fileBuffer
                })

                var tryCount = 0

                do {
                    await new Promise(r => setTimeout(r, 5 * 1000))

                    var { data: analysis } = await axios({
                        method: 'get',
                        url: 'https://api.metadefender.com/v4/file/' + upload.data_id,
                        headers: {
                            apiKey: settings.metadefender_api_key
                        }
                    })

                    tryCount++

                } while (analysis?.scan_results?.progress_percentage !== 100 && tryCount < 15)
            }

            if (analysis?.scan_results?.total_detected_avs >= 2)
                return warn(message, 'fichier: malicieux', settings)
        }
    }
}