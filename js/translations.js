// Translation System
const translations = {
    pt: {
        // Common
        liturgicalSeason: {
            quaresma: "Tempo da Quaresma",
            triduo: "Tríduo Pascal",
            pascal: "Tempo Pascal",
            advento: "Tempo do Advento",
            natal: "Tempo do Natal",
            comum: "Tempo Comum"
        },
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        
        // Index page
        massSchedules: "Horários de Missas",
        lastUpdate: "Última atualização",
        loading: "carregando...",
        dailyReadingsBtn: "Leituras do dia",
        developedBy: "Desenvolvido por",
        searchPlaceholder: "Busque por nome da paróquia ou bairro...",
        previous: "Anterior",
        next: "Próxima",
        page: "Página",
        of: "de",
        exploreMore: "Explore mais:",
        aboutUs: "Sobre Nós",
        massPreparation: "Preparação para a Missa",
        dataSource: "Dados obtidos de elodafe.com.br",
        dailyUpdate: "Atualizado diariamente. Este site não tem vínculo oficial com a Diocese.",
        contactText: "Duvidas ou sugestões? Entre em contato:",
        noParishFound: "Nenhuma paróquia encontrada com esses termos.",
        viewMassSchedules: "Ver Horários de Missas",
        visitOfficialPage: "Visitar página oficial",
        noCommunitiesRegistered: "Esta paróquia não possui comunidades cadastradas.",
        visitPageForInfo: "Visite a página oficial para informações referentes a esta comunidade.",
        
        // Daily readings page
        dailyReadings: "Leituras do Dia",
        firstReading: "Primeira Leitura",
        responsorialPsalm: "Salmo Responsorial",
        gospel: "Evangelho",
        noReadingFound: "Nenhuma leitura disponível para hoje.",
        dataSourceLiturgy: "Dados obtidos de liturgia.cancaonova.com",
        
        // Mass preparation page
        preparingForMass: "Preparando-se para a Santa Missa",
        preparingSubtitle: "Dicas e práticas espirituais para uma participação mais consciente e devota.",
        whyPrepare: "Por que se preparar para a Santa Missa?",
        whyPrepareText: "A Santa Missa é o ápice da vida cristã, onde celebramos o sacrifício de Cristo e nos unimos a Ele na Eucaristia. Preparar-se adequadamente para esse momento sagrado é essencial para vivenciar plenamente a graça e a presença de Deus.",
        practicesBeforeMass: "Práticas para Antes da Missa",
        practicesBeforeText: "Aqui estão algumas práticas que podem ajudá-lo a se preparar espiritualmente para a Santa Missa:",
        personalPrayer: "Oração pessoal:",
        personalPrayerText: "Reserve alguns minutos antes da missa para orar. Peça a Deus que prepare seu coração para receber a Sua graça.",
        readingOfDay: "Leitura das leituras do dia:",
        readingOfDayText: "Familiarize-se com as leituras que serão proclamadas durante a missa. Isso ajudará você a refletir melhor sobre a Palavra de Deus.",
        examineConsciousness: "Exame de consciência:",
        examineConsciousnessText: "Faça um breve exame de consciência e peça perdão pelos seus pecados. Isso o ajudará a participar da missa com o coração limpo.",
        innerSilence: "Silêncio interior:",
        innerSilenceText: "Chegue alguns minutos antes da missa e use esse tempo para se recolher em silêncio, afastando distrações e focando em Deus.",
        dressAppropriately: "Vestir-se adequadamente:",
        dressAppropriatelyText: "Escolha roupas modestas e respeitosas, que demonstrem reverência pelo sagrado.",
        duringMass: "Durante a Missa",
        duringMassText: "Durante a celebração, procure participar ativamente:",
        duringMassBullet1: "Cante os hinos e responda às orações com devoção.",
        duringMassBullet2: "Ouça atentamente as leituras e a homilia, buscando aplicá-las à sua vida.",
        duringMassBullet3: "Ao receber a Eucaristia, faça um ato de fé e amor a Jesus Cristo.",
        afterMass: "Depois da Missa",
        afterMassText: "Após a missa, agradeça a Deus pelo dom da Eucaristia e peça forças para viver o que foi celebrado. Leve a graça recebida para o seu dia a dia, transformando sua vida em um testemunho de fé.",
        finalReflection: "Reflexão Final",
        finalReflectionText: "A Santa Missa é um encontro pessoal com Cristo. Quanto mais nos preparamos para esse momento, mais frutos espirituais colheremos. Que cada missa seja uma experiência transformadora em sua vida de fé!",
        wantToKnowMore: "Quer saber mais sobre nós? Clique no botão ao lado",
        
        // About page
        aboutTitle: "Sobre o Na Hora da Missa",
        aboutSubtitle: "Conheça mais sobre o projeto Na Hora da Missa.",
        aboutNaHora: "Sobre o Na Hora da Missa",
        aboutText: "O <strong>Na Hora da Missa</strong> nasceu com um propósito simples, mas essencial: facilitar a vida dos fiéis que desejam encontrar os horários das missas em Uberlândia e acompanhar as leituras litúrgicas diárias. Acreditamos que a fé deve ser acessível e que a tecnologia pode ser uma aliada na vivência religiosa, conectando as pessoas à sua espiritualidade de forma prática e intuitiva.",
        ourMission: "Nossa Missão",
        ourMissionText: "Nossa missão é ajudar católicos a se organizarem melhor para participar das celebrações e refletir sobre as leituras do dia. Muitas vezes, encontrar o horário das missas ou as leituras diárias pode ser um desafio. Foi pensando nisso que criamos este site, garantindo que qualquer pessoa tenha acesso rápido e atualizado a essas informações essenciais para a caminhada cristã.",
        whatWeOffer: "O Que Oferecemos",
        whatWeOfferText: "No <strong>Na Hora da Missa</strong>, atualizamos diariamente:",
        whatWeOfferBullet1: "Os horários e locais das missas em Uberlândia, para que você possa encontrar a paróquia mais próxima ou um horário que encaixe na sua rotina.",
        whatWeOfferBullet2: "As leituras do dia, incluindo a primeira leitura, o salmo responsorial e o evangelho, permitindo que você acompanhe a liturgia onde estiver.",
        whatWeOfferText2: "Dessa forma, seja no início do dia, antes da missa ou em um momento de oração pessoal, você pode ter acesso às leituras sagradas e se preparar melhor espiritualmente.",
        freeService: "Um Serviço Gratuito e Comunitário",
        freeServiceText1: "Este é um projeto sem fins lucrativos, criado para servir a comunidade católica. Não temos vínculos oficiais com a Diocese, e todas as informações são organizadas e disponibilizadas de forma independente, com o único objetivo de ajudar os fiéis.",
        freeServiceText2: "Acreditamos que a tecnologia pode ser uma ferramenta para o bem, e queremos usá-la para aproximar as pessoas da fé, tornando o acesso às missas e às leituras diárias mais prático e acessível. Nosso compromisso é garantir que essa plataforma continue sendo útil para todos que desejam fortalecer sua espiritualidade no dia a dia.",
        howItWorks: "Como Funciona?",
        howItWorksText: "O site é atualizado automaticamente todos os dias, coletando os horários de missa e as leituras litúrgicas diretamente de fontes confiáveis. Assim, garantimos que você sempre tenha à disposição as informações mais recentes, sem a necessidade de buscar em várias fontes diferentes.",
        getInTouch: "Entre em Contato",
        getInTouchText: "Se você tem sugestões, encontrou alguma informação incorreta ou deseja contribuir com o projeto, estamos sempre abertos a melhorias! Entre em contato conosco pelo e-mail:",
        orGithub: "Ou pelo nosso github:",
        getInTouchText2: "Ficamos felizes em poder oferecer esse serviço e esperamos que ele seja útil para a sua vida de fé. Que Deus abençoe sua caminhada!"
    },
    en: {
        // Common
        liturgicalSeason: {
            quaresma: "Lent Season",
            triduo: "Paschal Triduum",
            pascal: "Easter Season",
            advento: "Advent Season",
            natal: "Christmas Season",
            comum: "Ordinary Time"
        },
        months: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
        
        // Index page
        massSchedules: "Mass Schedules",
        lastUpdate: "Last update",
        loading: "loading...",
        dailyReadingsBtn: "Daily Readings",
        developedBy: "Developed by",
        searchPlaceholder: "Search by parish name or neighborhood...",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",
        exploreMore: "Explore more:",
        aboutUs: "About Us",
        massPreparation: "Mass Preparation",
        dataSource: "Data obtained from elodafe.com.br",
        dailyUpdate: "Updated daily. This site has no official connection with the Diocese.",
        contactText: "Questions or suggestions? Contact us:",
        noParishFound: "No parishes found with these terms.",
        viewMassSchedules: "View Mass Schedules",
        visitOfficialPage: "Visit official page",
        noCommunitiesRegistered: "This parish has no registered communities.",
        visitPageForInfo: "Visit the official page for information about this community.",
        
        // Daily readings page
        dailyReadings: "Daily Readings",
        firstReading: "First Reading",
        responsorialPsalm: "Responsorial Psalm",
        gospel: "Gospel",
        noReadingFound: "No readings available for today.",
        dataSourceLiturgy: "Data obtained from liturgia.cancaonova.com",
        
        // Mass preparation page
        preparingForMass: "Preparing for Holy Mass",
        preparingSubtitle: "Tips and spiritual practices for more conscious and devout participation.",
        whyPrepare: "Why Prepare for Holy Mass?",
        whyPrepareText: "The Holy Mass is the summit of Christian life, where we celebrate Christ's sacrifice and unite ourselves with Him in the Eucharist. Preparing adequately for this sacred moment is essential to fully experience God's grace and presence.",
        practicesBeforeMass: "Practices Before Mass",
        practicesBeforeText: "Here are some practices that can help you prepare spiritually for Holy Mass:",
        personalPrayer: "Personal prayer:",
        personalPrayerText: "Set aside a few minutes before Mass to pray. Ask God to prepare your heart to receive His grace.",
        readingOfDay: "Reading of the day:",
        readingOfDayText: "Familiarize yourself with the readings that will be proclaimed during Mass. This will help you reflect better on the Word of God.",
        examineConsciousness: "Examination of conscience:",
        examineConsciousnessText: "Make a brief examination of conscience and ask forgiveness for your sins. This will help you participate in Mass with a clean heart.",
        innerSilence: "Inner silence:",
        innerSilenceText: "Arrive a few minutes before Mass and use this time to gather in silence, putting aside distractions and focusing on God.",
        dressAppropriately: "Dress appropriately:",
        dressAppropriatelyText: "Choose modest and respectful clothes that show reverence for the sacred.",
        duringMass: "During Mass",
        duringMassText: "During the celebration, try to participate actively:",
        duringMassBullet1: "Sing the hymns and respond to the prayers with devotion.",
        duringMassBullet2: "Listen attentively to the readings and homily, seeking to apply them to your life.",
        duringMassBullet3: "When receiving the Eucharist, make an act of faith and love to Jesus Christ.",
        afterMass: "After Mass",
        afterMassText: "After Mass, thank God for the gift of the Eucharist and ask for strength to live what was celebrated. Take the grace received into your daily life, transforming your life into a testimony of faith.",
        finalReflection: "Final Reflection",
        finalReflectionText: "Holy Mass is a personal encounter with Christ. The more we prepare for this moment, the more spiritual fruits we will reap. May each Mass be a transformative experience in your life of faith!",
        wantToKnowMore: "Want to know more about us? Click the button next to",
        
        // About page
        aboutTitle: "About At Mass Time",
        aboutSubtitle: "Learn more about the At Mass Time project.",
        aboutNaHora: "About At Mass Time",
        aboutText: "<strong>At Mass Time</strong> was born with a simple but essential purpose: to make life easier for the faithful who want to find Mass schedules in Uberlândia and follow the daily liturgical readings. We believe that faith should be accessible and that technology can be an ally in religious experience, connecting people to their spirituality in a practical and intuitive way.",
        ourMission: "Our Mission",
        ourMissionText: "Our mission is to help Catholics organize themselves better to participate in celebrations and reflect on the daily readings. Often, finding Mass times or daily readings can be a challenge. It was with this in mind that we created this site, ensuring that anyone has quick and updated access to this essential information for the Christian journey.",
        whatWeOffer: "What We Offer",
        whatWeOfferText: "At <strong>At Mass Time</strong>, we update daily:",
        whatWeOfferBullet1: "Mass times and locations in Uberlândia, so you can find the nearest parish or a time that fits your routine.",
        whatWeOfferBullet2: "Daily readings, including the first reading, responsorial psalm and gospel, allowing you to follow the liturgy wherever you are.",
        whatWeOfferText2: "This way, whether at the beginning of the day, before Mass or in a moment of personal prayer, you can have access to the sacred readings and prepare yourself better spiritually.",
        freeService: "A Free and Community Service",
        freeServiceText1: "This is a non-profit project, created to serve the Catholic community. We have no official ties with the Diocese, and all information is organized and made available independently, with the sole purpose of helping the faithful.",
        freeServiceText2: "We believe that technology can be a tool for good, and we want to use it to bring people closer to faith, making access to Masses and daily readings more practical and accessible. Our commitment is to ensure that this platform continues to be useful for everyone who wants to strengthen their spirituality in their daily lives.",
        howItWorks: "How Does It Work?",
        howItWorksText: "The site is automatically updated every day, collecting Mass times and liturgical readings directly from reliable sources. This way, we ensure that you always have the most recent information at your disposal, without the need to search from various different sources.",
        getInTouch: "Get in Touch",
        getInTouchText: "If you have suggestions, found any incorrect information or want to contribute to the project, we are always open to improvements! Contact us by email:",
        orGithub: "Or through our github:",
        getInTouchText2: "We are happy to be able to offer this service and we hope it will be useful for your life of faith. May God bless your journey!"
    }
};

// Language management functions
const LanguageManager = {
    currentLang: 'pt',
    
    init() {
        // Load saved language or default to Portuguese
        this.currentLang = localStorage.getItem('language') || 'pt';
        this.applyTranslations();
        this.updateLanguageButton();
    },
    
    toggle() {
        this.currentLang = this.currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem('language', this.currentLang);
        this.applyTranslations();
        this.updateLanguageButton();
        
        // Trigger custom event for other scripts to update
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    },
    
    get(key) {
        const keys = key.split('.');
        let value = translations[this.currentLang];
        
        for (const k of keys) {
            value = value[k];
            if (value === undefined) return key;
        }
        
        return value;
    },
    
    applyTranslations() {
        console.log('Applying translations for language:', this.currentLang);
        
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Found', elements.length, 'elements with data-i18n attribute');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                // For elements that need HTML preserved
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang === 'pt' ? 'pt-BR' : 'en';
    },
    
    updateLanguageButton() {
        const langBtn = document.getElementById('language-toggle');
        if (langBtn) {
            const flagIcon = langBtn.querySelector('.flag-icon');
            const langText = langBtn.querySelector('.lang-text');
            
            if (this.currentLang === 'pt') {
                flagIcon.textContent = '🇺🇸';
                langText.textContent = 'English';
            } else {
                flagIcon.textContent = '🇧🇷';
                langText.textContent = 'Português';
            }
        }
    },
    
    formatDate(date) {
        const months = this.get('months');
        return `${date.getDate()} ${this.currentLang === 'pt' ? 'de' : ''} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    },
    
    getLiturgicalSeasonText(seasonKey) {
        const seasons = this.get('liturgicalSeason');
        return seasons[seasonKey] || seasonKey;
    }
};

// Initialize on DOM load
if (document.readyState === 'loading') {
    console.log('Document is still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, initializing LanguageManager');
        LanguageManager.init();
    });
} else {
    console.log('Document already loaded, initializing LanguageManager immediately');
    LanguageManager.init();
}

