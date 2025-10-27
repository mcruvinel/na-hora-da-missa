document.addEventListener('DOMContentLoaded', function () {
    const readingsContainer = document.getElementById('readings-container');
    const lastUpdate = document.getElementById('last-update');

    // Load data from JSON file
    fetch('data/leitura-diaria.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Arquivo de dados não encontrado.');
            }
            return response.json();
        })
        .then(data => {
            lastUpdate.innerHTML = `<span data-i18n="lastUpdate">${LanguageManager.get('lastUpdate')}</span>: ${data.collection_date}`;

            if (!data.leituras) {
                readingsContainer.innerHTML = '<div class="text-center text-gray-600">Nenhuma leitura encontrada.</div>';
                return;
            }

            // Render the readings
            renderReadings(data.leituras);
        })
        .catch(error => {
            readingsContainer.innerHTML = `<div class="text-center text-red-600">Erro ao carregar os dados: ${error.message}</div>`;
            console.error('Erro:', error);
        });

    function renderReadings(leituras) {
        readingsContainer.innerHTML = '';

        // Render each reading
        const sections = [
            { key: 'primeira_leitura', titleKey: 'firstReading' },
            { key: 'salmo', titleKey: 'responsorialPsalm' },
            { key: 'evangelho', titleKey: 'gospel' }
        ];

        sections.forEach(section => {
            if (leituras[section.key] && leituras[section.key].texto) {
                const card = document.createElement('div');
                card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all dark:bg-gray-700 dark:text-white';

                // Section title
                const title = document.createElement('h2');
                title.className = 'text-2xl font-bold text-blue-900 mb-4 dark:text-blue-300';
                title.textContent = LanguageManager.get(section.titleKey);
                card.appendChild(title);

                // Reading text
                const text = document.createElement('div');
                text.className = 'text-gray-700 dark:text-gray-300 space-y-4';
                text.innerHTML = leituras[section.key].texto.replace(/\n/g, '<br>'); // Replace newlines with <br>
                card.appendChild(text);

                readingsContainer.appendChild(card);
            }
        });

        if (readingsContainer.innerHTML === '') {
            readingsContainer.innerHTML = `<div class="text-center text-gray-600">${LanguageManager.get('noReadingFound')}</div>`;
        }
    }
    
    // Listen for language changes and re-render
    window.addEventListener('languageChanged', () => {
        // Re-fetch and render data
        fetch('data/leitura-diaria.json')
            .then(response => response.json())
            .then(data => {
                if (data.leituras) {
                    renderReadings(data.leituras);
                }
            });
    });
});
});