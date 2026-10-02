document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('readings-container');
    const lastUpdate = document.getElementById('last-update');

    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };

    const renderLine = (line) => {
        const paragraph = element('p', line.role === 'response' ? 'font-semibold' : line.role === 'rubric' ? 'italic' : '');
        line.segments.forEach((segment) => {
            if (segment.verse) paragraph.append(element('sup', 'text-xs font-bold text-blue-500 mr-1', segment.verse));
            paragraph.append(`${line.role === 'versicle' || line.role === 'response' ? '— ' : ''}${segment.text} `);
        });
        return paragraph;
    };

    const renderReading = (reading) => {
        const card = element('div', 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all dark:bg-gray-700 dark:text-white');
        card.append(element('h2', 'text-2xl font-bold text-blue-900 mb-1 dark:text-blue-300', reading.title));
        card.append(element('p', 'text-sm text-gray-500 mb-4 dark:text-gray-300', reading.reference));
        const body = element('div', 'text-gray-700 dark:text-gray-300 space-y-3 text-left');
        reading.lines.forEach((line) => body.append(renderLine(line)));
        card.append(body);
        return card;
    };

    fetch('data/v1/liturgy/today.json')
        .then((response) => {
            if (!response.ok) throw new Error('Arquivo de dados não encontrado.');
            return response.json();
        })
        .then((liturgy) => {
            lastUpdate.textContent = `${liturgy.celebration} · atualizado em ${new Date(liturgy.generatedAt).toLocaleString('pt-BR')}`;
            container.replaceChildren(...liturgy.readings.map(renderReading));
        })
        .catch((error) => {
            container.replaceChildren(element('div', 'text-center text-red-600', `Erro ao carregar as leituras: ${error.message}`));
        });
});
