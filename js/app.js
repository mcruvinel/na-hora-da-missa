//  Dynamic Color Palette Logic 
const COLOR_PALETTE_MAP = {
    // Seasons calculated by getLiturgicalSeason()
    'Tempo da Quaresma': { bg: 'bg-purple-900', text: 'text-purple-300', accent: 'text-yellow-400', border: 'border-purple-500' }, // Lent (Roxo/Purple)
    'Tríduo Pascal': { bg: 'bg-gray-800', text: 'text-white', accent: 'text-red-500', border: 'border-red-500' }, // Paschal Triduum (Vermelho/Red)
    'Tempo Pascal': { bg: 'bg-white', text: 'text-green-800', accent: 'text-yellow-600', border: 'border-yellow-600' }, // Easter (Branco/White/Gold)
    'Tempo do Advento': { bg: 'bg-purple-800', text: 'text-purple-300', accent: 'text-yellow-300', border: 'border-purple-400' }, // Advent (Roxo/Purple)
    'Tempo do Natal': { bg: 'bg-red-800', text: 'text-red-100', accent: 'text-yellow-400', border: 'border-red-400' }, // Christmas (Red/White)

    // Default or common seasons
    'Tempo Comum': { bg: 'bg-green-700', text: 'text-green-100', accent: 'text-yellow-300', border: 'border-green-500' }, // Ordinary Time (Verde/Green)
    'Default': { bg: 'bg-blue-900', text: 'text-white', accent: 'text-yellow-500', border: 'border-blue-500' } // Default/Original
};

function applyDynamicColors() {
    const liturgicalSeasonElement = document.getElementById('liturgical-season');
    const mainBody = document.querySelector('body');
    const seasonText = liturgicalSeasonElement ? liturgicalSeasonElement.textContent.trim() : 'Default';


    const palette = COLOR_PALETTE_MAP[seasonText] || COLOR_PALETTE_MAP.Default;
    if (mainBody) {
        mainBody.className = mainBody.className.replace(/\b(bg-\w+-\d{2,3}|bg-gray-\d{2,3}|dark:bg-\w+-\d{2,3})\b/g, '').trim();
        mainBody.classList.add(palette.bg);
    }
    document.querySelectorAll('a').forEach(link => {
        link.className = link.className.replace(/\b(text-\w+-\d{2,3}|text-blue-\d{2,3}|text-yellow-\d{2,3})\b/g, '').trim();
        link.classList.add(palette.accent);
    });
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.className = item.className.replace(/\b(border-\w+-\d{2,3}|border-blue-\d{2,3}|border-yellow-\d{2,3})\b/g, '').trim();
        item.classList.add(`border-${palette.accent.replace('text-', '')}`);
    });


    document.querySelectorAll('.church-name').forEach(name => {
        name.className = name.className.replace(/\b(text-\w+-\d{2,3}|text-blue-\d{2,3})\b/g, '').trim();
        name.classList.add(palette.accent);
    });

    console.log(`Applied theme for: ${seasonText} (${palette.bg})`);
}


document.addEventListener('DOMContentLoaded', function () {
    // --- START: Dynamic Color Palette Hook (PR #6) ---
    // Apply colors immediately on load. Use a slight delay to ensure the season text (from HTML or other scripts) is set.
    setTimeout(applyDynamicColors, 50);
    // --- END: Dynamic Color Palette Hook (PR #6) ---


    const churchList = document.getElementById('church-list');
    const lastUpdate = document.getElementById('last-update');
    const searchInput = document.getElementById('search');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let churches = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    // Criação do elemento de referência no header
    const header = document.createElement('div');
    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    // Load data from JSON file
    fetch('data/churches.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Arquivo de dados não encontrado.');
            }
            return response.json();
        })
        .then(data => {
            churches = data.churches;
            console.log(churches);
            lastUpdate.textContent = `Última atualização: ${data.collection_date}`;

            if (churches.length === 0) {
                churchList.innerHTML = '<div class="text-center text-gray-600">Nenhuma paróquia encontrada.</div>';
                return;
            }

            // Render all churches initially
            renderChurches(churches);
            updatePagination();

            // Configure search
            searchInput.addEventListener('input', function () {
                const term = this.value.toLowerCase();
                const result = churches.filter(church =>
                    church.name.toLowerCase().includes(term) ||
                    (church.address && church.address.toLowerCase().includes(term)) ||
                    church.communities.some(community =>
                        community.name.toLowerCase().includes(term) ||
                        (community.address && community.address.toLowerCase().includes(term)) ||
                        community.schedule.some(schedule => schedule.toLowerCase().includes(term))
                    ));

                currentPage = 1; // Reset to first page on new search
                renderChurches(result);
                updatePagination();
            });

            // Pagination
            prevPageButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderChurches(churches);
                    updatePagination();
                }
            });

            nextPageButton.addEventListener('click', () => {
                if (currentPage < Math.ceil(churches.length / itemsPerPage)) {
                    currentPage++;
                    renderChurches(churches);
                    updatePagination();
                }
            });
        })
        .catch(error => {
            churchList.innerHTML = `<div class="text-center text-red-600">Erro ao carregar os dados: ${error.message}</div>`;
            console.error('Erro:', error);
        });

    function renderChurches(list) {
        if (list.length === 0) {
            churchList.innerHTML = '<div class="text-center text-gray-600">Nenhuma paróquia encontrada com esses termos.</div>';
            return;
        }

        churchList.innerHTML = '';

        // Use a grid layout for the cards
        churchList.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

        // Calculate items for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = list.slice(startIndex, endIndex);

        paginatedItems.forEach(church => {
            const card = document.createElement('div');
            card.className = 'church-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all dark:bg-gray-700 dark:text-white';

            // Church name - FIRST based on the HTML inspector
            const name = document.createElement('h2');
            name.className = 'church-name text-2xl font-bold text-blue-900 mb-4 dark:text-blue-300';
            name.textContent = church.name;
            card.appendChild(name);

            // Church address - SECOND based on the HTML inspector
            if (church.address && church.address.trim()) {
                const address = document.createElement('p');
                address.className = 'church-address text-gray-700 mb-4 dark:text-gray-300';
                address.textContent = church.address.trim();
                card.appendChild(address);
            }

            // Church link - THIRD based on the HTML inspector
            if (church.link) {
                const link = document.createElement('a');
                link.className = 'church-link text-blue-500 hover:text-blue-700 mb-4 inline-block dark:text-blue-400';
                link.href = church.link;
                link.target = '_blank';
                link.textContent = 'Visitar página oficial';
                card.appendChild(link);
            }

            // Communities container
            const communitiesContainer = document.createElement('div');
            communitiesContainer.className = 'communities-container space-y-4';

            if (church.communities && church.communities.length > 0) {
                church.communities.forEach((community, index) => {
                    const communityDiv = document.createElement('div');
                    communityDiv.className = 'community';

                    // Community address (if available)
                    if (community.address && community.address.trim()) {
                        const communityAddress = document.createElement('p');
                        communityAddress.className = 'community-address text-gray-700 mb-2 dark:text-gray-300';
                        communityAddress.textContent = community.address.trim();
                        communityDiv.appendChild(communityAddress);
                    }

                    // Community name
                    const communityName = document.createElement('h3');
                    communityName.className = 'community-name text-xl font-semibold text-gray-800 mb-2 dark:text-gray-200';
                    communityName.textContent = `${index + 1}. ${community.name}`;
                    communityDiv.appendChild(communityName);

                    // Schedule container
                    const scheduleDiv = document.createElement('div');
                    scheduleDiv.className = 'schedule space-y-2';

                    if (community.schedule && community.schedule.length > 0) {
                        community.schedule.forEach(schedule => {
                            if (schedule && schedule.trim()) {
                                // Split the schedule into individual lines
                                const scheduleLines = schedule.split('\n');
                                scheduleLines.forEach(line => {
                                    if (line.trim()) {
                                        const scheduleItem = document.createElement('div');
                                        scheduleItem.className = 'schedule-item bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 dark:bg-gray-600 dark:border-blue-400 dark:text-gray-200';
                                        scheduleItem.textContent = line.trim();
                                        scheduleDiv.appendChild(scheduleItem);
                                    }
                                });
                            }
                        });
                    } else {
                        const noSchedule = document.createElement('div');
                        noSchedule.className = 'schedule-item bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-500 dark:bg-gray-600 dark:border-yellow-400 dark:text-gray-200';
                        noSchedule.textContent = 'Visite a página oficial para informações referentes a esta comunidade.';
                        scheduleDiv.appendChild(noSchedule);
                    }

                    communityDiv.appendChild(scheduleDiv);
                    communitiesContainer.appendChild(communityDiv);
                });
            } else {
                const noCommunity = document.createElement('div');
                noCommunity.className = 'community text-gray-600 dark:text-gray-400 mt-4';
                noCommunity.textContent = 'Esta paróquia não possui comunidades cadastradas.';
                communitiesContainer.appendChild(noCommunity);
            }

            card.appendChild(communitiesContainer);
            churchList.appendChild(card);
        });
    }

    function updatePagination() {
        const filteredChurches = churches.filter(church => {
            const term = searchInput.value.toLowerCase();
            return church.name.toLowerCase().includes(term) ||
                (church.address && church.address.toLowerCase().includes(term)) ||
                church.communities.some(community =>
                    community.name.toLowerCase().includes(term) ||
                    (community.address && community.address.toLowerCase().includes(term)) ||
                    community.schedule.some(schedule => schedule.toLowerCase().includes(term))
                );
        });

        const totalPages = Math.ceil(filteredChurches.length / itemsPerPage);
        pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
    }
});