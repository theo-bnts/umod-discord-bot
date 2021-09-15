export async function run (client, message, settings) {

    if (!message.content)
        return

    const options = {
        uppercase: {
            regex: /[A-Z]+/g,
            translation: 'majuscules'
        },
        bold: {
            operator: '**',
            regex: createMarkdownRegex('**'),
            translation: 'gras'
        },
        underline: {
            operator: '__',
            regex: createMarkdownRegex('__'),
            translation: 'souligné'
        },
        strikethrough: {
            operator: '~~',
            regex: createMarkdownRegex('~~'),
            translation: 'barré'
        },
        spoilers: {
            operator: '||',
            regex: createMarkdownRegex('||'),
            translation: 'spoilers'
        },
        code: {
            operator: '`',
            regex: createMarkdownRegex('`'),
            translation: 'code'
        },
        blank_lines: {
            regex: /^[ \t]*$/gm,
            translation: 'lignes vides'
        },
        zalgo: {
            regex: /([aeiouy]\u0308)|[\u0300-\u036f\u0489]/ig, 
            translation: 'zalgo'
        }
    }

    for (const [key, option] of Object.entries(options)) {

        option.matches = message
            .content
            .match(option.regex)
            ?.map(m => removeMarkdown(m))
        || []

        option.count = option
            .matches
            .length

        option.length = option
            .matches
            .map(m => m.length)
            .reduce((a, b) => a + b, 0)
        
        option.percent = option.length * 100 / removeMarkdown(message.content).length

        if (
            settings[key + '_moderation'] &&
            option.length >= settings[key + '_minimum_length'] &&
            option.percent >= settings[key + '_minimum_percent']
        )
            return processDeletion(message, 'formattage excessif: ' + option.translation)
    }

    function createMarkdownRegex(operator) {

        operator = new Array(...operator)
            .map(c => '\\' + c)
            .join('')

        return new RegExp(operator + '[^' + operator + ']+' + operator, 'g')
    }

    function removeMarkdown(segment) {

        for (const option of Object.values(options))
            for (const match of formatMatches(segment.matchAll(option.regex)).reverse())
                if (option.operator) {
                    segment = new Array(...segment)
                    segment.splice(match.end - option.operator.length, option.operator.length)
                    segment.splice(match.start, option.operator.length)
                    segment = segment.join('')
                }

        return segment
    }
}