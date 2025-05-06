// Script principal para o Naruto Pixel Card Game

document.addEventListener("DOMContentLoaded", () => {
    console.log("Jogo Naruto Pixel Card Game iniciado e DOM carregado!");

    // --- Variáveis Globais ---
    let shoppingCart = []; 
    let isInSellMode = false;
    let sellCart = []; 

    // --- Definição da Estrutura das Cartas ---
    class Card {
        constructor(id, name, type, cost, description, image, attack = 0, defenseBuff = 0, effect = null, duration = 0, critChance = 0, effectValue = 0, defensePercent = 0, summonDotDamage = 0) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.cost = cost; 
            this.description = description;
            this.image = image;
            this.attack = attack;
            this.defenseBuff = defenseBuff;
            this.defensePercent = defensePercent;
            this.effect = effect;
            this.duration = duration;
            this.critChance = critChance;
            this.effectValue = effectValue;
            this.summonDotDamage = summonDotDamage;
            this.level = 1;
            this.xp = 0;
        }

        getHTMLElement(context = "battle") {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.classList.add(`type-${this.type.toLowerCase()}`);
            cardElement.dataset.cardId = this.id;

            let imagePlaceholder = this.type.substring(0, 3).toUpperCase();
            if (this.type === "Jutsu") imagePlaceholder = "JUT";
            if (this.type === "Taijutsu") imagePlaceholder = "TAI";
            if (this.type === "Defesa") imagePlaceholder = "DEF";
            if (this.type === "Item") imagePlaceholder = "ITM";
            if (this.type === "Buff") imagePlaceholder = "BUF";
            if (this.type === "Debuff") imagePlaceholder = "DEB";
            if (this.type === "Armadura") imagePlaceholder = "ARM";
            if (this.type === "Arma") imagePlaceholder = "WPN";
            if (this.type === "Modo") imagePlaceholder = "MOD";
            if (this.type === "Material") imagePlaceholder = "MAT";
            if (this.type === "Invocação") imagePlaceholder = "INV";

            const levelMultiplier = 1 + (this.level - 1) * 0.05;
            const currentAttack = this.attack > 0 ? Math.round(this.attack * levelMultiplier) : 0;
            const currentDefense = this.defenseBuff > 0 ? Math.round(this.defenseBuff * levelMultiplier) : 0;
            const currentDefensePercentValue = this.defensePercent > 0 ? this.defensePercent * levelMultiplier : 0; // Mantém como decimal para cálculo
            const currentSummonDot = this.summonDotDamage > 0 ? Math.round(this.summonDotDamage * levelMultiplier) : 0;

            let statsHTML = "";
            if (currentAttack > 0) {
                statsHTML += `<span>Atk: ${currentAttack}${this.critChance > 0 ? ` (${Math.round(this.critChance * 100 * levelMultiplier)}%C)` : ""}</span>`;
            }
            if (currentDefense > 0) {
                statsHTML += `<span>Def: ${currentDefense}${this.duration > 0 ? ` (${this.duration}t)` : ""}</span>`;
            }
            if (currentDefensePercentValue > 0) {
                statsHTML += `<span>Def%: ${Math.round(currentDefensePercentValue * 100)}%${this.duration > 0 ? ` (${this.duration}t)` : ""}</span>`;
            }
            if (currentSummonDot > 0) {
                statsHTML += `<span>DoT: ${currentSummonDot}/${this.duration}t</span>`;
            }
            if (statsHTML === "") statsHTML = "<span></span>";

            cardElement.innerHTML = `
                <div class="card-name">${this.name} ${this.level > 1 ? `(Lvl ${this.level})` : ""}</div>
                <div class="card-cost">${this.cost > 0 ? this.cost : ""}</div>
                <div class="card-image-placeholder">${imagePlaceholder}</div>
                <div class="card-type">${this.type}</div>
                <div class="card-desc">${this.description}</div>
                <div class="card-stats">
                    ${statsHTML}
                </div>
            `;
            
            if (context === "battle") {
                 cardElement.addEventListener("click", () => {
                    console.log(`Tentando jogar a carta: ${this.name} (ID: ${this.id})`);
                    playCardFromHand(this.id);
                });
            } 
            return cardElement;
        }

        addXP(amount) {
            this.xp += amount;
            const xpToNextLevel = this.level * 100;
            if (this.xp >= xpToNextLevel) {
                this.level++;
                this.xp -= xpToNextLevel;
                console.log(`Carta ${this.name} subiu para o nível ${this.level}!`);
            }
        }
    }

    const cardDatabase = {
        // Jutsus
        "jutsu001": { name: "Rasengan", type: "Jutsu", cost: 30, description: "Causa 40 de dano.", image: "rasengan.png", attack: 40, price: 150 },
        "jutsu002": { name: "Chidori", type: "Jutsu", cost: 35, description: "Causa 45 de dano. Crítico 15%", image: "chidori.png", attack: 45, critChance: 0.15, price: 160 },
        "jutsu003": { name: "Kage Bunshin", type: "Jutsu", cost: 20, description: "Compra 1 carta.", image: "kagebunshin.png", effect: "draw_card", effectValue: 1, price: 80 },
        "jutsu004": { name: "Bola de Fogo", type: "Jutsu", cost: 25, description: "Causa 35 de dano de Fogo.", image: "fireball.png", attack: 35, price: 100 },
        "taijutsu001": { name: "Chute Dinâmico", type: "Taijutsu", cost: 10, description: "Causa 20 de dano físico.", image: "dynamic_kick.png", attack: 20, price: 50 },
        "taijutsu002": { name: "Rajada Leões", type: "Taijutsu", cost: 15, description: "Causa 25 de dano físico.", image: "lion_barrage.png", attack: 25, price: 60 },
        "jutsu005": { name: "Dragão de Água", type: "Jutsu", cost: 40, description: "Causa 50 de dano de Água.", image: "water_dragon.png", attack: 50, price: 180 },
        "jutsu006": { name: "Parede de Lama", type: "Defesa", cost: 20, description: "Ganha 30% de Defesa por 2 turnos.", image: "mud_wall.png", defensePercent: 0.30, duration: 2, price: 100 },
        "jutsu007": { name: "Rasenshuriken", type: "Jutsu", cost: 60, description: "Causa 70 de dano. Ignora defesa.", image: "rasenshuriken.png", attack: 70, effect: "ignore_defense", price: 300 },
        "jutsu008": { name: "Amaterasu", type: "Jutsu", cost: 55, description: "Causa 30 de dano por 3 turnos.", image: "amaterasu.png", effect: "burn", effectValue: 30, duration: 3, price: 280 },
        "jutsu009": { name: "Susanoo Ribcage", type: "Defesa", cost: 50, description: "Bloqueia todo o dano no próximo turno.", image: "susanoo_rib.png", effect: "block_all_damage", duration: 1, price: 250 },
        "jutsu010": { name: "Kamui (Short Range)", type: "Jutsu", cost: 70, description: "Remove uma carta da mão inimiga.", image: "kamui_short.png", effect: "opponent_discard", effectValue: 1, price: 350 },
        "taijutsu003": { name: "Lótus Primária", type: "Taijutsu", cost: 40, description: "Causa 60 dano. Causa 10 dano a si.", image: "primary_lotus.png", attack: 60, effect: "self_damage", effectValue: 10, price: 180 },
        "invoc001": { name: "Invocação: Sapo", type: "Invocação", cost: 30, description: "Invoca Gamabunta. 15 dano/3 turnos.", image: "summon_toad.png", effect: "summon_dot", summonDotDamage: 15, duration: 3, price: 140 },
        "jutsu012": { name: "Jutsu Médico", type: "Jutsu", cost: 25, description: "Recupera 40 de Vida.", image: "medical_jutsu.png", effect: "heal", effectValue: 40, price: 100 },
        "jutsu013": { name: "Genjutsu: Sharingan", type: "Jutsu", cost: 30, description: "Oponente descarta 1 carta.", image: "genjutsu_sharingan.png", effect: "opponent_discard", effectValue: 1, price: 120 },
        "jutsu018": { name: "Tsukuyomi", type: "Jutsu", cost: 75, description: "Atordoa oponente por 1 turno. Causa 20 dano.", image: "tsukuyomi.png", effect: "stun", duration: 1, attack: 20, price: 320 },
        
        // Itens
        "item001": { name: "Kunai", type: "Item", cost: 5, description: "Causa 10 de dano.", image: "kunai.png", attack: 10, price: 20 },
        "item002": { name: "Pílula Soldado", type: "Item", cost: 10, description: "Recupera 15 Chakra.", image: "soldier_pill.png", effect: "recover_chakra", effectValue: 15, price: 30 },
        "item006": { name: "Bandagem", type: "Item", cost: 5, description: "Recupera 10 de Vida.", image: "bandage.png", effect: "heal", effectValue: 10, price: 15 }, 
        
        // Equipamentos - Armaduras
        "armor001": { name: "Colete Chūnin", type: "Armadura", slot: "Peito", cost: 0, description: "Equip: +20 Vida Máx, Reduz dano em 10%.", image: "chunin_vest.png", effect: "equip_passive", equip_effect: "increase_max_health_and_defense_percent", effectValue: { health: 20, defensePercent: 0.10 }, price: 200 },
        "armor002": { name: "Protetor Testa", type: "Armadura", slot: "Cabeça", cost: 0, description: "Equip: +5 Defesa base.", image: "forehead_protector.png", effect: "equip_passive", equip_effect: "increase_base_defense", effectValue: { defense: 5 }, price: 100 },
        "armor003": { name: "Elmo Reforçado", type: "Armadura", slot: "Cabeça", cost: 0, description: "Equip: +15 Vida Máx, +5 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_health_and_fixed_defense", effectValue: { maxHealth: 15, defense: 5 }, price: 150 },
        "armor004": { name: "Peitoral de Couro Leve", type: "Armadura", slot: "Peito", cost: 0, description: "Equip: +10 Vida Máx, +3% Defesa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_health_and_defense_percent", effectValue: { health: 10, defensePercent: 0.03 }, price: 130 },
        "armor005": { name: "Calças de Batalha", type: "Armadura", slot: "Pernas", cost: 0, description: "Equip: +12 Vida Máx, +2 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_health_and_fixed_defense", effectValue: { maxHealth: 12, defense: 2 }, price: 120 },
        "armor006": { name: "Botas Ágeis", type: "Armadura", slot: "Pés", cost: 0, description: "Equip: +5 Vida Máx, +2% Defesa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_health_and_defense_percent", effectValue: { health: 5, defensePercent: 0.02 }, price: 110 },
        "armor007": { name: "Luvas de Precisão", type: "Armadura", slot: "Mãos", cost: 0, description: "Equip: +3% Chance Crítica.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_crit_chance", effectValue: { critChanceBoost: 0.03 }, price: 140 },
        "armor008": { name: "Máscara Anbu", type: "Armadura", slot: "Cabeça", cost: 0, description: "Equip: +5 Chakra Máx, +2% Defesa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_chakra_and_defense_percent", effectValue: { maxChakra: 5, defensePercent: 0.02 }, price: 160 },
        "armor009": { name: "Armadura Samurai Leve", type: "Armadura", slot: "Peito", cost: 0, description: "Equip: +25 Vida Máx, +8 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_health_and_fixed_defense", effectValue: { maxHealth: 25, defense: 8 }, price: 280 },
        "armor010": { name: "Grevas Resistentes", type: "Armadura", slot: "Pernas", cost: 0, description: "Equip: +8 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_base_defense", effectValue: { defense: 8 }, price: 170 },
        "armor011": { name: "Sandálias de Monge", type: "Armadura", slot: "Pés", cost: 0, description: "Equip: +10 Chakra Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_chakra", effectValue: { maxChakra: 10 }, price: 130 },
        "armor012": { name: "Manoplas Protetoras", type: "Armadura", slot: "Mãos", cost: 0, description: "Equip: +6 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_base_defense", effectValue: { defense: 6 }, price: 100 },
        "armor013": { name: "Amuleto da Sorte", type: "Armadura", slot: "Acessório1", cost: 0, description: "Equip: +2% Chance Crítica, +5 Vida Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_crit_and_health", effectValue: { critChanceBoost: 0.02, maxHealth: 5 }, price: 150 },
        "armor014": { name: "Anel de Chakra", type: "Armadura", slot: "Acessório2", cost: 0, description: "Equip: +8 Chakra Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_max_chakra", effectValue: { maxChakra: 8 }, price: 120 },

        // Equipamentos - Armas
        "weapon001": { name: "Espada Kusanagi", type: "Arma", slot: "Ferramenta1", cost: 0, description: "Equip: +10 Ataque base.", image: "kusanagi.png", effect: "equip_passive", equip_effect: "increase_base_attack", effectValue: { attackBoost: 10 }, price: 250 },
        "weapon002": { name: "Tanto Afiado", type: "Arma", slot: "Ferramenta1", cost: 0, description: "Equip: +8 Ataque, +5% Crítico.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_crit", effectValue: { attackBoost: 8, critChanceBoost: 0.05 }, price: 180 },
        "weapon003": { name: "Katana Longa", type: "Arma", slot: "Ferramenta1", cost: 0, description: "Equip: +15 Ataque.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_base_attack", effectValue: { attackBoost: 15 }, price: 220 },
        "weapon004": { name: "Manoplas de Aço", type: "Arma", slot: "Ferramenta2", cost: 0, description: "Equip: +5 Ataque, +10 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_and_fixed_defense", effectValue: { attackBoost: 5, defense: 10 }, price: 200 },
        "weapon005": { name: "Nunchaku Veloz", type: "Arma", slot: "Ferramenta2", cost: 0, description: "Equip: +7 Ataque, +3% Crítico.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_crit", effectValue: { attackBoost: 7, critChanceBoost: 0.03 }, price: 240 },
        "weapon006": { name: "Bo Staff Resistente", type: "Arma", slot: "Ferramenta3", cost: 0, description: "Equip: +6 Ataque, +5% Defesa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_and_defense_percent", effectValue: { attackBoost: 6, defensePercent: 0.05 }, price: 230 },
        "weapon007": { name: "Shuriken Gigante", type: "Arma", slot: "Ferramenta1", cost: 0, description: "Equip: +12 Ataque, -5 Chakra Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_decrease_max_chakra", effectValue: { attackBoost: 12, maxChakra: -5 }, price: 190 },
        "weapon008": { name: "Corrente com Foice", type: "Arma", slot: "Ferramenta2", cost: 0, description: "Equip: +9 Ataque, +3 Defesa Fixa.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_and_fixed_defense", effectValue: { attackBoost: 9, defense: 3 }, price: 260 },
        "weapon009": { name: "Leque Cortante", type: "Arma", slot: "Ferramenta3", cost: 0, description: "Equip: +7 Ataque, +5 Chakra Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_increase_max_chakra", effectValue: { attackBoost: 7, maxChakra: 5 }, price: 210 },
        "weapon010": { name: "Adaga Envenenada", type: "Arma", slot: "Ferramenta1", cost: 0, description: "Equip: +6 Ataque, +3 Chakra Máx.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_increase_max_chakra", effectValue: { attackBoost: 6, maxChakra: 3 }, price: 250 },
        "weapon011": { name: "Clava Pesada", type: "Arma", slot: "Ferramenta3", cost: 0, description: "Equip: +18 Ataque, -10% Chance Crítica.", image: "placeholder.png", effect: "equip_passive", equip_effect: "increase_attack_decrease_crit", effectValue: { attackBoost: 18, critChanceBoost: -0.10 }, price: 240 },

        // Materiais
        "material001": { name: "Fragmento de Chakra", type: "Material", cost: 0, description: "Usado para criar cartas.", image: "chakra_fragment.png", price: 10 }
    };

    let playerProfile = {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        currency: 1000, 
        maxHealthBase: 100,
        maxChakraBase: 50,
        cardCollection: {
            "jutsu001": { level: 1, xp: 0, quantity: 2 },
            "taijutsu001": { level: 1, xp: 0, quantity: 3 },
            "item001": { level: 1, xp: 0, quantity: 5 },
            "armor001": { level: 1, xp: 0, quantity: 2 }, // Qtd aumentada para teste multi-equip
            "armor002": { level: 1, xp: 0, quantity: 3 }, // Qtd aumentada
            "armor003": { level: 1, xp: 0, quantity: 2 }, 
            "armor004": { level: 1, xp: 0, quantity: 1 },
            "armor005": { level: 1, xp: 0, quantity: 1 },
            "armor006": { level: 1, xp: 0, quantity: 1 },
            "armor007": { level: 1, xp: 0, quantity: 2 },
            "armor013": { level: 1, xp: 0, quantity: 1 },
            "armor014": { level: 1, xp: 0, quantity: 1 },
            "weapon001": { level: 1, xp: 0, quantity: 1 }, 
            "weapon002": { level: 1, xp: 0, quantity: 1 }, 
            "material001": { level: 1, xp: 0, quantity: 10 }
        },
        deck: [],
        equippedArmor: {
            Cabeça: [], 
            Peito: ["armor001"], 
            Pernas: [], 
            Pés: [], 
            Mãos: [], 
            Acessório1: [], 
            Acessório2: []
        },
        equippedTools: {
            Ferramenta1: "weapon001", 
            Ferramenta2: null, 
            Ferramenta3: null
        },
        materials: { "material001": 10 },
        chests: { "common_chest": 1 }
    };
    initializePlayerDeck();

    const battleState = {
        turn: 0,
        currentPlayer: null, 
        gamePhase: "setup", 
        player: {
            health: 0, maxHealth: 0, chakra: 0, maxChakra: 0,
            defense: 0, defensePercent: 0, attackBoost: 0, critChanceBoost: 0,
            statusEffects: [], deck: [], hand: [], discardPile: []
        },
        opponent: {
            health: 0, maxHealth: 0, chakra: 0, maxChakra: 0,
            defense: 0, defensePercent: 0, attackBoost: 0, critChanceBoost: 0,
            statusEffects: [], deck: [], hand: [], discardPile: []
        }
    };

    // --- Elementos da UI ---
    const playerProfileDisplay = document.getElementById("player-profile-display");
    const playerLevelDisplay = document.getElementById("player-level");
    const playerXpDisplay = document.getElementById("player-xp");
    const playerCurrencyDisplay = document.getElementById("player-currency");
    const inventoryDisplay = document.getElementById("inventory-display");
    const messageLogElement = document.getElementById("message-log");
    
    const toggleSellModeButton = document.getElementById("toggle-sell-mode-button");
    const sellCartContainer = document.getElementById("sell-cart-container");
    const sellCartItemsElement = document.getElementById("sell-cart-items");
    const sellCartTotalValueElement = document.getElementById("sell-cart-total-value");
    const confirmSellButton = document.getElementById("confirm-sell-button");
    const clearSellCartButton = document.getElementById("clear-sell-cart-button");

    const playerHealthDisplay = document.getElementById("player-health");
    const playerMaxHealthDisplay = document.getElementById("player-max-health");
    const playerHealthBarFill = document.getElementById("player-health-bar-fill");
    const playerChakraDisplay = document.getElementById("player-chakra");
    const playerMaxChakraDisplay = document.getElementById("player-max-chakra");
    const playerChakraBarFill = document.getElementById("player-chakra-bar-fill");
    const playerStatusEffectsDisplay = document.getElementById("player-status-effects");
    const playerTempStatsDisplay = document.getElementById("player-temp-stats");
    const playerHandElement = document.getElementById("player-hand");

    const opponentHealthDisplay = document.getElementById("opponent-health");
    const opponentMaxHealthDisplay = document.getElementById("opponent-max-health");
    const opponentHealthBarFill = document.getElementById("opponent-health-bar-fill");
    const opponentChakraDisplay = document.getElementById("opponent-chakra");
    const opponentMaxChakraDisplay = document.getElementById("opponent-max-chakra");
    const opponentChakraBarFill = document.getElementById("opponent-chakra-bar-fill");
    const opponentStatusEffectsDisplay = document.getElementById("opponent-status-effects");
    const opponentTempStatsDisplay = document.getElementById("opponent-temp-stats");
    const opponentHandElement = document.getElementById("opponent-hand");
    const turnCounterDisplay = document.getElementById("turn-counter");
    const endTurnButton = document.getElementById("end-turn-button");

    const shopDisplay = document.getElementById("shop-display");
    const cartItemsElementShop = document.getElementById("cart-items"); 
    const cartTotalElementShop = document.getElementById("cart-total"); 
    const finalizePurchaseButton = document.getElementById("finalize-purchase-button"); 

    function logMessage(message, type = "info") {
        console.log(message);
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        if (messageLogElement.children.length > 1) {
             messageLogElement.insertBefore(messageElement, messageLogElement.children[1]);
        } else {
             messageLogElement.appendChild(messageElement);
        }
        while (messageLogElement.children.length > 51) { 
            messageLogElement.removeChild(messageLogElement.lastChild);
        }
        messageLogElement.scrollTop = 0;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createCardInstance(cardId, level = 1, xp = 0) {
        const cardData = cardDatabase[cardId];
        if (!cardData) {
            console.error(`Dados não encontrados para a carta ID: ${cardId}`);
            return null;
        }
        const cardInstance = new Card(
            cardId, cardData.name, cardData.type, cardData.cost, cardData.description, cardData.image,
            cardData.attack, cardData.defenseBuff, cardData.effect, cardData.duration, cardData.critChance,
            cardData.effectValue, cardData.defensePercent, cardData.summonDotDamage
        );
        cardInstance.level = level;
        cardInstance.xp = xp;
        return cardInstance;
    }
    
    function updatePlayerProfileUI() {
        if (!playerProfileDisplay) return;
        playerLevelDisplay.textContent = playerProfile.level;
        playerXpDisplay.textContent = `${playerProfile.xp} / ${playerProfile.xpToNextLevel}`;
        playerCurrencyDisplay.textContent = playerProfile.currency;
    }

    function updatePlayerStatsUI() {
        if (!playerHealthDisplay) return; 
        const player = battleState.player;
        playerHealthDisplay.textContent = player.health;
        playerMaxHealthDisplay.textContent = player.maxHealth;
        playerHealthBarFill.style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
        playerChakraDisplay.textContent = player.chakra;
        playerMaxChakraDisplay.textContent = player.maxChakra;
        playerChakraBarFill.style.width = `${Math.max(0, (player.chakra / player.maxChakra) * 100)}%`;
        updateStatusEffectsUI(player, playerStatusEffectsDisplay);
        updateTempStatsUI(player, playerTempStatsDisplay);
    }

    function updateOpponentStatsUI() {
        if (!opponentHealthDisplay) return; 
        const opponent = battleState.opponent;
        opponentHealthDisplay.textContent = opponent.health;
        opponentMaxHealthDisplay.textContent = opponent.maxHealth;
        opponentHealthBarFill.style.width = `${Math.max(0, (opponent.health / opponent.maxHealth) * 100)}%`;
        opponentChakraDisplay.textContent = opponent.chakra;
        opponentMaxChakraDisplay.textContent = opponent.maxChakra;
        opponentChakraBarFill.style.width = `${Math.max(0, (opponent.chakra / opponent.maxChakra) * 100)}%`;
        updateStatusEffectsUI(opponent, opponentStatusEffectsDisplay);
        updateTempStatsUI(opponent, opponentTempStatsDisplay);
    }

    function updateStatusEffectsUI(target, displayElement) {
        if (!displayElement) return;
        displayElement.innerHTML = "";
        target.statusEffects.forEach(effect => {
            const effectElement = document.createElement("span");
            effectElement.classList.add("status-effect-icon", `effect-${effect.type}`);
            effectElement.title = `${effect.name}: ${effect.description || ""} (${effect.duration}t restantes)`;
            let effectText = effect.name.substring(0, 3).toUpperCase();
            effectElement.textContent = `${effectText}(${effect.duration})`;
            displayElement.appendChild(effectElement);
        });
    }

    function updateTempStatsUI(target, displayElement) {
        if (!displayElement) return;
        displayElement.innerHTML = "";
        let statsText = "";
        if (target.attackBoost !== 0) statsText += `<span>Atk Boost: ${target.attackBoost > 0 ? "+" : ""}${target.attackBoost}</span>`;
        if (target.defense !== 0) statsText += `<span>Def Fixa: ${target.defense}</span>`;
        if (target.defensePercent !== 0) statsText += `<span>Def %: ${Math.round(target.defensePercent * 100)}%</span>`;
        if (target.critChanceBoost !== 0) statsText += `<span>Crit Boost: +${Math.round(target.critChanceBoost * 100)}%</span>`;
        displayElement.innerHTML = statsText;
    }

    function updateHandUI(playerType) {
        const handElement = playerType === "player" ? playerHandElement : opponentHandElement;
        const player = battleState[playerType];
        if (!handElement) return;
        handElement.innerHTML = ""; 
        if (player.hand.length === 0) {
            handElement.innerHTML = `<p>Mão ${playerType === "player" ? "Jogador" : "Oponente"} Vazia</p>`;
            return;
        }
        player.hand.forEach((cardInstance, index) => {
            if (playerType === "player") {
                const cardElement = cardInstance.getHTMLElement("battle");
                // O listener de playCardFromHand já é adicionado em getHTMLElement se context for battle
                handElement.appendChild(cardElement);
            } else {
                const cardBackElement = document.createElement("div");
                cardBackElement.classList.add("card", "card-back");
                cardBackElement.textContent = "???";
                handElement.appendChild(cardBackElement);
            }
        });
    }
    
    function updateTurnUI() {
        if (turnCounterDisplay) turnCounterDisplay.textContent = battleState.turn;
    }

    // --- Lógica de Inventário e Venda ---
    function toggleSellMode() {
        isInSellMode = !isInSellMode;
        if (isInSellMode) {
            toggleSellModeButton.textContent = "Sair do Modo de Venda";
            toggleSellModeButton.style.backgroundColor = "#c0392b";
            sellCartContainer.style.display = "block";
            logMessage("Modo de venda ativado. Selecione cartas para vender.");
        } else {
            toggleSellModeButton.textContent = "Vender Cartas";
            toggleSellModeButton.style.backgroundColor = ""; 
            sellCartContainer.style.display = "none";
            clearSellCart(); 
            logMessage("Modo de venda desativado.");
        }
        displayInventory(); 
    }

    function displayInventory() {
        if (!inventoryDisplay) return;
        inventoryDisplay.innerHTML = "";
        const categories = { "Jutsu": [], "Taijutsu": [], "Defesa": [], "Item": [], "Buff": [], "Debuff": [], "Modo": [], "Armadura": [], "Arma": [], "Invocação": [], "Material": [], "Outros": [] };

        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            const collectionInfo = playerProfile.cardCollection[cardId];
            if (cardData && collectionInfo.quantity > 0) {
                if (categories[cardData.type]) {
                    categories[cardData.type].push({ id: cardId, data: cardData, info: collectionInfo });
                } else {
                    categories["Outros"].push({ id: cardId, data: cardData, info: collectionInfo });
                }
            }
        }

        for (const categoryName in categories) {
            if (categories[categoryName].length > 0) {
                const categoryContainer = document.createElement("div");
                categoryContainer.classList.add("inventory-category");
                categoryContainer.innerHTML = `<h3>${categoryName}</h3>`;
                const itemsContainer = document.createElement("div");
                itemsContainer.classList.add("inventory-items");
                categoryContainer.appendChild(itemsContainer);
                categories[categoryName].sort((a, b) => a.data.name.localeCompare(b.data.name));

                categories[categoryName].forEach(item => {
                    const cardInstance = createCardInstance(item.id, item.info.level, item.info.xp);
                    if (!cardInstance) return;
                    const cardElement = cardInstance.getHTMLElement(isInSellMode ? "sell" : "inventory");
                    const quantityDisplay = document.createElement("div");
                    quantityDisplay.classList.add("card-quantity");
                    quantityDisplay.textContent = `x${item.info.quantity}`;
                    cardElement.appendChild(quantityDisplay);
                    cardElement.title = `${item.data.name} (Lvl ${item.info.level}) - ${item.data.description}`;
                    
                    if (isInSellMode) {
                        const inSellCart = sellCart.find(cartItem => cartItem.cardId === item.id);
                        if (inSellCart && inSellCart.quantity > 0) {
                            cardElement.classList.add("selected-for-sell");
                            const sellQuantityOverlay = document.createElement("div");
                            sellQuantityOverlay.classList.add("card-sell-quantity-overlay");
                            sellQuantityOverlay.textContent = `V: ${inSellCart.quantity}`;
                            cardElement.appendChild(sellQuantityOverlay);
                        }
                        if (!cardDatabase[item.id].price || cardDatabase[item.id].price <= 0 || cardDatabase[item.id].type === "Material") {
                            cardElement.style.opacity = "0.5";
                            cardElement.style.cursor = "not-allowed";
                            cardElement.onclick = (e) => { 
                                e.stopPropagation(); 
                                logMessage(`${cardDatabase[item.id].name} não pode ser vendido.`); 
                            }; 
                        } else {
                             cardElement.onclick = (e) => { 
                                e.stopPropagation(); 
                                addCardToSellCart(item.id);
                            }; 
                        }
                    } else {
                        cardElement.onclick = null; 
                    }
                    itemsContainer.appendChild(cardElement);
                });
                inventoryDisplay.appendChild(categoryContainer);
            }
        }
        updateSellCartDisplay();
    }

    function addCardToSellCart(cardId) {
        if (!isInSellMode) return;
        const cardData = cardDatabase[cardId];
        const collectionInfo = playerProfile.cardCollection[cardId];
        if (!cardData || !collectionInfo || collectionInfo.quantity <= 0) {
            logMessage("Carta inválida ou indisponível."); return;
        }
        if (!cardData.price || cardData.price <= 0 || cardData.type === "Material") {
            logMessage(`${cardData.name} não pode ser vendido.`); return;
        }
        const existingCartItem = sellCart.find(item => item.cardId === cardId);
        const maxSellable = collectionInfo.quantity;
        if (existingCartItem) {
            if (existingCartItem.quantity < maxSellable) existingCartItem.quantity++;
            else { logMessage(`Todas as ${maxSellable} unidades de ${cardData.name} já estão no carrinho.`); return; }
        } else {
            sellCart.push({ cardId: cardId, quantity: 1, sellPricePerUnit: Math.floor(cardData.price / 2) });
        }
        logMessage(`${cardData.name} (x1) adicionado ao carrinho de venda.`);
        displayInventory();
    }

    function removeCardFromSellCart(cardId, removeAll = false) {
        const cartItemIndex = sellCart.findIndex(item => item.cardId === cardId);
        if (cartItemIndex === -1) return;
        const cardData = cardDatabase[cardId];
        if (removeAll || sellCart[cartItemIndex].quantity <= 1) {
            logMessage(`${cardData.name} (todas as ${sellCart[cartItemIndex].quantity} unidades) removido(s) do carrinho.`);
            sellCart.splice(cartItemIndex, 1);
        } else {
            sellCart[cartItemIndex].quantity--;
            logMessage(`${cardData.name} (x1) removido. Restam: ${sellCart[cartItemIndex].quantity}`);
        }
        displayInventory();
    }

    function updateSellCartDisplay() {
        if (!sellCartItemsElement || !sellCartTotalValueElement) return;
        sellCartItemsElement.innerHTML = "";
        let totalSellValue = 0;
        if (sellCart.length === 0) {
            sellCartItemsElement.innerHTML = "<p>Seu carrinho de venda está vazio.</p>";
            confirmSellButton.disabled = true;
        } else {
            sellCart.forEach(item => {
                const cardData = cardDatabase[item.cardId];
                if (cardData) {
                    const itemValue = item.quantity * item.sellPricePerUnit;
                    totalSellValue += itemValue;
                    const entry = document.createElement("div");
                    entry.classList.add("sell-cart-item-entry");
                    entry.innerHTML = `
                        <span class="sell-cart-item-name">${cardData.name} (x${item.quantity})</span>
                        <span class="sell-cart-item-value">${itemValue} Joias</span>
                        <button class="remove-sell-item-btn" data-card-id="${item.cardId}" title="Remover 1">-</button>
                        <button class="remove-sell-item-btn all" data-card-id="${item.cardId}" title="Remover Todos">X</button>
                    `;
                    sellCartItemsElement.appendChild(entry);
                }
            });
            confirmSellButton.disabled = false;
        }
        sellCartTotalValueElement.textContent = totalSellValue;
        document.querySelectorAll(".sell-cart-item-entry .remove-sell-item-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const cardIdToRemove = event.target.dataset.cardId;
                const removeAll = event.target.classList.contains("all");
                removeCardFromSellCart(cardIdToRemove, removeAll);
            });
        });
    }

    function confirmSellTransaction() {
        if (sellCart.length === 0) { logMessage("Carrinho de venda vazio."); return; }
        let totalValueGained = 0;
        let itemsSoldSummary = [];
        sellCart.forEach(item => {
            const cardData = cardDatabase[item.cardId];
            const collectionInfo = playerProfile.cardCollection[item.cardId];
            if (cardData && collectionInfo && collectionInfo.quantity >= item.quantity) {
                collectionInfo.quantity -= item.quantity;
                const valueGainedForItem = item.quantity * item.sellPricePerUnit;
                totalValueGained += valueGainedForItem;
                itemsSoldSummary.push(`${item.quantity}x ${cardData.name}`);
                if (collectionInfo.quantity <= 0) {
                    delete playerProfile.cardCollection[item.cardId];
                    if (cardData.type !== "Armadura" && cardData.type !== "Arma" && cardData.type !== "Material") {
                        playerProfile.deck = playerProfile.deck.filter(id => id !== item.cardId);
                    }
                }
            } else {
                logMessage(`Erro ao vender ${item.quantity}x ${cardData ? cardData.name : "carta desconhecida"}.`);
            }
        });
        if (totalValueGained > 0) {
            playerProfile.currency += totalValueGained;
            logMessage(`Venda concluída! Ganhou ${totalValueGained} Joias por: ${itemsSoldSummary.join(", ")}.`);
        }
        clearSellCart();
        updatePlayerProfileUI();
        displayInventory();
    }

    function clearSellCart() {
        sellCart = [];
        displayInventory(); 
        logMessage("Carrinho de venda esvaziado.");
    }
    
    function displayShop() {
        if (!shopDisplay) return;
        shopDisplay.innerHTML = "";
        const shopCurrencyDisplay = document.createElement("div");
        shopCurrencyDisplay.id = "shop-currency"; 
        shopCurrencyDisplay.textContent = `Moedas: ${playerProfile.currency}`;
        shopDisplay.appendChild(shopCurrencyDisplay);

        Object.keys(cardDatabase).forEach(cardId => {
            const cardData = cardDatabase[cardId];
            if (cardData.price > 0 && cardData.type !== "Material") { 
                const shopItem = document.createElement("div");
                shopItem.classList.add("shop-item");
                const cardInstance = createCardInstance(cardId);
                const cardElement = cardInstance.getHTMLElement("shop"); 
                cardElement.onclick = null; 
                
                const priceDisplay = document.createElement("p");
                priceDisplay.classList.add("shop-item-price");
                priceDisplay.textContent = `${cardData.price} Joias`;
                
                const buyButton = document.createElement("button");
                buyButton.classList.add("game-button", "buy-button");
                buyButton.textContent = "Comprar";
                buyButton.onclick = () => addToCartShop(cardId);

                shopItem.appendChild(cardElement);
                shopItem.appendChild(priceDisplay);
                shopItem.appendChild(buyButton);
                shopDisplay.appendChild(shopItem);
            }
        });
    }

    function addToCartShop(cardId) { 
        const cardData = cardDatabase[cardId];
        if (!cardData) return;
        shoppingCart.push(cardId); 
        logMessage(`${cardData.name} adicionado ao carrinho de compra.`);
        updateCartDisplayShop();
    }

    function removeFromCartShop(index) { 
        const removedCardId = shoppingCart.splice(index, 1)[0];
        const cardData = cardDatabase[removedCardId];
        if (cardData) logMessage(`${cardData.name} removido do carrinho de compra.`);
        updateCartDisplayShop();
    }

    function updateCartDisplayShop() { 
        if (!cartItemsElementShop || !cartTotalElementShop) return;
        cartItemsElementShop.innerHTML = "";
        let totalCost = 0;
        if (shoppingCart.length === 0) {
            cartItemsElementShop.innerHTML = "<p>Seu carrinho está vazio.</p>";
        } else {
            const cartCounts = {};
            shoppingCart.forEach(cardId => {
                cartCounts[cardId] = (cartCounts[cardId] || 0) + 1;
                totalCost += cardDatabase[cardId]?.price || 0;
            });
            Object.keys(cartCounts).forEach(cardId => {
                const cardData = cardDatabase[cardId];
                const count = cartCounts[cardId];
                if (cardData) {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("cart-item");
                    itemElement.innerHTML = `
                        <span>${cardData.name} (x${count})</span>
                        <span>${cardData.price * count} Joias</span>
                        <button class="remove-cart-item-btn" data-card-id="${cardId}">X</button>
                    `;
                    cartItemsElementShop.appendChild(itemElement);
                }
            });
            document.querySelectorAll("#cart-items .remove-cart-item-btn").forEach(button => {
                button.onclick = (event) => {
                    const cardIdToRemove = event.target.dataset.cardId;
                    const indexToRemove = shoppingCart.findIndex(id => id === cardIdToRemove);
                    if (indexToRemove !== -1) removeFromCartShop(indexToRemove);
                };
            });
        }
        cartTotalElementShop.textContent = `Total: ${totalCost} Joias`;
        finalizePurchaseButton.disabled = shoppingCart.length === 0 || totalCost > playerProfile.currency;
    }

    function finalizePurchase() {
        let totalCost = 0;
        shoppingCart.forEach(cardId => { totalCost += cardDatabase[cardId]?.price || 0; });
        if (totalCost > playerProfile.currency) { alert("Moedas insuficientes!"); return; }
        if (shoppingCart.length === 0) { alert("Carrinho vazio!"); return; }
        playerProfile.currency -= totalCost;
        logMessage(`Compra finalizada! Custo: ${totalCost} Joias.`);
        shoppingCart.forEach(cardId => { addCardToCollection(cardId, 1); });
        shoppingCart = [];
        updateCartDisplayShop();
        updatePlayerProfileUI();
        if (document.getElementById("inventory-area").classList.contains("active-section")) displayInventory();
        const shopCurrencyDisplay = document.getElementById("shop-currency");
        if (shopCurrencyDisplay) shopCurrencyDisplay.textContent = `Moedas: ${playerProfile.currency}`;
    }

    function addCardToCollection(cardId, quantity = 1) {
        if (!cardDatabase[cardId]) return;
        if (playerProfile.cardCollection[cardId]) {
            playerProfile.cardCollection[cardId].quantity += quantity;
        } else {
            playerProfile.cardCollection[cardId] = { level: 1, xp: 0, quantity: quantity };
        }
        console.log(`${quantity}x ${cardDatabase[cardId].name} adicionado(s) à coleção.`);
        const cardData = cardDatabase[cardId];
        if (cardData && cardData.type !== "Material" && cardData.type !== "Armadura" && cardData.type !== "Arma" && cardData.type !== "Modo") {
             if (playerProfile.deck.filter(id => id === cardId).length < 3) playerProfile.deck.push(cardId);
        }
    }

    function removeItemFromCollection(itemId, quantity = 1, removeFromDeckIfApplicable = true) {
        if (!playerProfile.cardCollection[itemId]) return false;
        if (playerProfile.cardCollection[itemId].quantity < quantity) return false;
        
        playerProfile.cardCollection[itemId].quantity -= quantity;
        console.log(`${quantity}x ${cardDatabase[itemId].name} removido(s) da coleção.`);

        if (playerProfile.cardCollection[itemId].quantity <= 0) {
            delete playerProfile.cardCollection[itemId];
            console.log(`Item ${cardDatabase[itemId].name} esgotado e removido da coleção.`);
            if (removeFromDeckIfApplicable) {
                const cardData = cardDatabase[itemId];
                // Só remove do deck se não for equipamento/material
                if (cardData && cardData.type !== "Armadura" && cardData.type !== "Arma" && cardData.type !== "Material" && cardData.type !== "Modo") {
                    playerProfile.deck = playerProfile.deck.filter(id => id !== itemId);
                }
            }
        }
        return true;
    }

    // --- Lógica de Navegação entre Seções ---
    const navCombatButton = document.getElementById("nav-combat");
    const navInventoryButton = document.getElementById("nav-inventory");
    const navShopButton = document.getElementById("nav-shop");
    const navEquipmentButton = document.getElementById("nav-equipment");
    const navCraftButton = document.getElementById("nav-craft");
    const navChestsButton = document.getElementById("nav-chests");
    const navButtons = [navCombatButton, navInventoryButton, navShopButton, navEquipmentButton, navCraftButton, navChestsButton].filter(Boolean);

    function showSection(sectionId) {
        document.querySelectorAll(".game-section").forEach(section => section.classList.remove("active-section"));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add("active-section");
        else { console.error(`Seção ${sectionId} não encontrada!`); return; }

        navButtons.forEach(button => button.classList.remove("active"));
        let activeButton = null;
        switch (sectionId) {
            case "game-area": activeButton = navCombatButton; if (battleState.gamePhase === "setup") initializeBattle(); break;
            case "inventory-area": activeButton = navInventoryButton; displayInventory(); break;
            case "shop-area": activeButton = navShopButton; displayShop(); updateCartDisplayShop(); break;
            case "equipment-area": activeButton = navEquipmentButton; displayEquipmentTab(); break;
            case "craft-area": activeButton = navCraftButton; /* displayCraftingTab(); */ break;
            case "chests-area": activeButton = navChestsButton; /* displayChestsTab(); */ break;
        }
        if (activeButton) activeButton.classList.add("active");
    }

    if (navCombatButton) navCombatButton.addEventListener("click", () => showSection("game-area"));
    if (navInventoryButton) navInventoryButton.addEventListener("click", () => showSection("inventory-area"));
    if (navShopButton) navShopButton.addEventListener("click", () => showSection("shop-area"));
    if (navEquipmentButton) navEquipmentButton.addEventListener("click", () => showSection("equipment-area"));
    if (navCraftButton) navCraftButton.addEventListener("click", () => showSection("craft-area"));
    if (navChestsButton) navChestsButton.addEventListener("click", () => showSection("chests-area"));
    if (endTurnButton) endTurnButton.addEventListener("click", endPlayerTurn);
    if (finalizePurchaseButton) finalizePurchaseButton.addEventListener("click", finalizePurchase);
    if (toggleSellModeButton) toggleSellModeButton.addEventListener("click", toggleSellMode);
    if (confirmSellButton) confirmSellButton.addEventListener("click", confirmSellTransaction);
    if (clearSellCartButton) clearSellCartButton.addEventListener("click", clearSellCart);

    // --- Lógica do Jogo (Batalha) ---
    function initializePlayerDeck() {
        playerProfile.deck = [];
        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            if (cardData && cardData.type !== "Material" && cardData.type !== "Armadura" && cardData.type !== "Arma" && cardData.type !== "Modo") {
                const quantityInDeck = Math.min(playerProfile.cardCollection[cardId].quantity, 3);
                for (let i = 0; i < quantityInDeck; i++) playerProfile.deck.push(cardId);
            }
        }
        while (playerProfile.deck.length < 20 && playerProfile.deck.length > 0) {
             playerProfile.deck.push(playerProfile.deck[Math.floor(Math.random() * playerProfile.deck.length)]);
        }
    }

    function initializeBattle() {
        logMessage("Inicializando batalha...");
        battleState.turn = 1;
        battleState.gamePhase = "initialization";
        
        // Resetar e aplicar bônus de equipamento para o jogador
        battleState.player.maxHealth = playerProfile.maxHealthBase;
        battleState.player.maxChakra = playerProfile.maxChakraBase;
        battleState.player.statusEffects = [];
        applyPassiveEquipmentBonuses(battleState.player, playerProfile.equippedArmor, playerProfile.equippedTools);
        battleState.player.health = battleState.player.maxHealth;
        battleState.player.chakra = battleState.player.maxChakra;
        
        const levelScalingFactor = 1 + (playerProfile.level - 1) * 0.10;
        battleState.opponent.maxHealth = Math.round(100 * levelScalingFactor);
        battleState.opponent.maxChakra = Math.round(50 * levelScalingFactor);
        battleState.opponent.statusEffects = [];
        // Oponente pode ter equipamentos fixos ou nenhum, por simplicidade, não aplicamos bônus variáveis aqui
        battleState.opponent.defense = 0; battleState.opponent.defensePercent = 0; battleState.opponent.attackBoost = 0; battleState.opponent.critChanceBoost = 0;
        battleState.opponent.health = battleState.opponent.maxHealth;
        battleState.opponent.chakra = battleState.opponent.maxChakra;
        battleState.opponent.deck = [...playerProfile.deck]; 
        shuffleArray(battleState.opponent.deck);

        battleState.player.deck = [...playerProfile.deck];
        shuffleArray(battleState.player.deck);
        battleState.player.hand = []; battleState.player.discardPile = [];
        battleState.opponent.hand = []; battleState.opponent.discardPile = [];
        drawCards("player", 5);
        drawCards("opponent", 5);
        updatePlayerStatsUI(); updateOpponentStatsUI();
        updateHandUI("player"); updateHandUI("opponent");
        updateTurnUI();
        if (messageLogElement.children.length > 1) messageLogElement.innerHTML = "<p>Log da Batalha:</p>";
        if(endTurnButton) endTurnButton.disabled = true;
        startPlayerTurn();
    }

    function applyPassiveEquipmentBonuses(targetCharacter, equippedArmor, equippedTools) {
        // Resetar stats base que são recalculados (maxHealth/Chakra são base + bônus)
        targetCharacter.maxHealth = (targetCharacter === battleState.player) ? playerProfile.maxHealthBase : targetCharacter.maxHealth; // Preserva o base do oponente se já definido
        targetCharacter.maxChakra = (targetCharacter === battleState.player) ? playerProfile.maxChakraBase : targetCharacter.maxChakra;
        targetCharacter.attackBoost = 0;
        targetCharacter.defense = 0;
        targetCharacter.defensePercent = 0;
        targetCharacter.critChanceBoost = 0;

        // Aplicar bônus de Armaduras (múltiplas por slot)
        for (const slotName in equippedArmor) {
            const armorSlotArray = equippedArmor[slotName]; // É um array de card IDs
            armorSlotArray.forEach(itemId => {
                const itemData = cardDatabase[itemId];
                if (itemData && itemData.effect === "equip_passive" && itemData.equip_effect) {
                    applySingleItemBonus(targetCharacter, itemData);
                }
            });
        }

        // Aplicar bônus de Ferramentas (uma por slot)
        for (const slotName in equippedTools) {
            const itemId = equippedTools[slotName]; // É um card ID ou null
            if (itemId) {
                const itemData = cardDatabase[itemId];
                if (itemData && itemData.effect === "equip_passive" && itemData.equip_effect) {
                    applySingleItemBonus(targetCharacter, itemData);
                }
            }
        }
        targetCharacter.defensePercent = Math.min(targetCharacter.defensePercent, 0.90); 
        logMessage(`${targetCharacter === battleState.player ? "Jogador" : "Oponente"} - Bônus Passivos Aplicados.`);
    }

    function applySingleItemBonus(targetCharacter, itemData) {
        // Função auxiliar para aplicar bônus de um único item
        switch (itemData.equip_effect) {
            case "increase_max_health":
                targetCharacter.maxHealth += itemData.effectValue.maxHealth || itemData.effectValue;
                break;
            case "increase_base_defense":
                targetCharacter.defense += itemData.effectValue.defense || itemData.effectValue;
                break;
            case "increase_base_attack":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost || itemData.effectValue;
                break;
            case "increase_defense_percent":
                targetCharacter.defensePercent += itemData.effectValue.defensePercent || itemData.effectValue;
                break;
            case "increase_max_health_and_defense_percent":
                targetCharacter.maxHealth += itemData.effectValue.health;
                targetCharacter.defensePercent += itemData.effectValue.defensePercent;
                break;
            case "increase_max_health_and_fixed_defense":
                targetCharacter.maxHealth += itemData.effectValue.maxHealth;
                targetCharacter.defense += itemData.effectValue.defense;
                break;
            case "increase_attack_crit":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.critChanceBoost += itemData.effectValue.critChanceBoost;
                break;
            case "increase_attack_and_fixed_defense":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.defense += itemData.effectValue.defense;
                break;
            case "increase_attack_and_defense_percent":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.defensePercent += itemData.effectValue.defensePercent;
                break;
            case "increase_attack_decrease_max_chakra":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.maxChakra += itemData.effectValue.maxChakra;
                if (targetCharacter.maxChakra < 1) targetCharacter.maxChakra = 1; 
                break;
            case "increase_attack_increase_max_chakra":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.maxChakra += itemData.effectValue.maxChakra;
                break;
            case "increase_attack_decrease_crit":
                targetCharacter.attackBoost += itemData.effectValue.attackBoost;
                targetCharacter.critChanceBoost += itemData.effectValue.critChanceBoost;
                break;
            case "increase_crit_chance":
                targetCharacter.critChanceBoost += itemData.effectValue.critChanceBoost || itemData.effectValue;
                break;
            case "increase_max_chakra_and_defense_percent":
                targetCharacter.maxChakra += itemData.effectValue.maxChakra;
                targetCharacter.defensePercent += itemData.effectValue.defensePercent;
                break;
            case "increase_max_chakra":
                targetCharacter.maxChakra += itemData.effectValue.maxChakra || itemData.effectValue;
                break;
            case "increase_crit_and_health":
                targetCharacter.critChanceBoost += itemData.effectValue.critChanceBoost;
                targetCharacter.maxHealth += itemData.effectValue.maxHealth;
                break;
        }
    }

    function drawCards(playerType, count) {
        const player = battleState[playerType];
        for (let i = 0; i < count; i++) {
            if (player.hand.length >= 7) break;
            if (player.deck.length === 0) {
                if (player.discardPile.length === 0) break;
                player.deck = [...player.discardPile];
                player.discardPile = [];
                shuffleArray(player.deck);
                logMessage(`${playerType === "player" ? "Jogador" : "Oponente"} embaralhou o descarte no deck.`);
            }
            if (player.deck.length > 0) {
                const cardId = player.deck.pop();
                const cardInstance = createCardInstance(cardId, playerProfile.cardCollection[cardId]?.level || 1, playerProfile.cardCollection[cardId]?.xp || 0);
                if (cardInstance) player.hand.push(cardInstance);
            }
        }
    }

    function startPlayerTurn() {
        logMessage("Seu turno!");
        battleState.currentPlayer = "player";
        battleState.gamePhase = "player_turn";
        drawCards("player", 1);
        processTurnStartEffects(battleState.player);
        updatePlayerStatsUI(); updateHandUI("player");
        if(endTurnButton) endTurnButton.disabled = false;
    }

    function endPlayerTurn() {
        if (battleState.gamePhase !== "player_turn") return;
        logMessage("Você finalizou seu turno.");
        if(endTurnButton) endTurnButton.disabled = true;
        processTurnEndEffects(battleState.player);
        if (checkGameOver()) return;
        startOpponentTurn();
    }
    
    function startOpponentTurn() {
        logMessage("Turno do Oponente!");
        battleState.currentPlayer = "opponent";
        battleState.gamePhase = "opponent_turn";
        drawCards("opponent", 1);
        processTurnStartEffects(battleState.opponent);
        updateOpponentStatsUI(); updateHandUI("opponent");
        opponentAI(); 
    }

    function endOpponentTurn() {
        if (battleState.gamePhase !== "opponent_turn") return;
        logMessage("Oponente finalizou o turno.");
        processTurnEndEffects(battleState.opponent);
        if (checkGameOver()) return;
        battleState.turn++;
        updateTurnUI();
        startPlayerTurn();
    }

    function playCardFromHand(cardId, handIndex) {
        const player = battleState.currentPlayer === "player" ? battleState.player : battleState.opponent;
        const target = battleState.currentPlayer === "player" ? battleState.opponent : battleState.player;
        let actualHandIndex = -1;
        let cardInstance = null;
        if (handIndex !== undefined && player.hand[handIndex]?.id === cardId) {
            actualHandIndex = handIndex;
            cardInstance = player.hand[actualHandIndex];
        } else {
            actualHandIndex = player.hand.findIndex(c => c.id === cardId);
            if (actualHandIndex !== -1) cardInstance = player.hand[actualHandIndex];
        }
        if (!cardInstance) { logMessage("Carta não encontrada na mão."); return; }
        if (player.chakra < cardInstance.cost) { logMessage("Chakra insuficiente!"); return; }
        player.chakra -= cardInstance.cost;
        logMessage(`${battleState.currentPlayer} jogou ${cardInstance.name}.`);
        player.hand.splice(actualHandIndex, 1);
        player.discardPile.push(cardInstance.id); 
        applyCardEffect(cardInstance, player, target);
        updatePlayerStatsUI(); updateOpponentStatsUI();
        updateHandUI("player"); updateHandUI("opponent");
        if (checkGameOver()) return;
    }

    function applyCardEffect(card, caster, target) {
        if (card.attack > 0) {
            dealDamage(target, card.attack, card.type);
        }
        if (card.effect === "heal") {
            caster.health = Math.min(caster.maxHealth, caster.health + card.effectValue);
            logMessage(`${caster === battleState.player ? "Jogador" : "Oponente"} curou ${card.effectValue} de vida.`);
        }
        if (card.effect === "draw_card") {
            drawCards(caster === battleState.player ? "player" : "opponent", card.effectValue);
            logMessage(`${caster === battleState.player ? "Jogador" : "Oponente"} comprou ${card.effectValue} carta(s).`);
        }
        if (card.effect === "recover_chakra") {
            caster.chakra = Math.min(caster.maxChakra, caster.chakra + card.effectValue);
            logMessage(`${caster === battleState.player ? "Jogador" : "Oponente"} recuperou ${card.effectValue} de chakra.`);
        }
        // Adicionar mais efeitos aqui
    }

    function dealDamage(targetEntity, damage, sourceType = "direct") {
        let actualDamage = damage;
        actualDamage = Math.max(0, actualDamage - targetEntity.defense);
        actualDamage = Math.round(actualDamage * (1 - targetEntity.defensePercent));
        targetEntity.health -= actualDamage;
        logMessage(`${targetEntity === battleState.player ? "Jogador" : "Oponente"} recebeu ${actualDamage} de dano de ${sourceType}.`);
        if (targetEntity.health < 0) targetEntity.health = 0;
    }
    
    function processTurnStartEffects(entity) { /* ... */ }
    function processTurnEndEffects(entity) { /* ... */ }
    function checkGameOver() {
        if (battleState.player.health <= 0) {
            logMessage("Você foi derrotado!");
            battleState.gamePhase = "game_over";
            if(endTurnButton) endTurnButton.disabled = true;
            return true;
        }
        if (battleState.opponent.health <= 0) {
            logMessage("Você venceu!");
            playerProfile.xp += 50; 
            playerProfile.currency += 20; 
            if (playerProfile.xp >= playerProfile.xpToNextLevel) {
                playerProfile.level++;
                playerProfile.xp = 0;
                playerProfile.xpToNextLevel = playerProfile.level * 100;
                logMessage(`Você subiu para o Nível ${playerProfile.level}!`);
            }
            updatePlayerProfileUI();
            battleState.gamePhase = "game_over";
            if(endTurnButton) endTurnButton.disabled = true;
            return true;
        }
        return false;
    }

    function opponentAI() {
        if (battleState.opponent.hand.length > 0) {
            for (let i = 0; i < battleState.opponent.hand.length; i++) {
                const cardToPlay = battleState.opponent.hand[i];
                if (battleState.opponent.chakra >= cardToPlay.cost) {
                    playCardFromHand(cardToPlay.id, i);
                    break; 
                }
            }
        }
        setTimeout(endOpponentTurn, 1000); 
    }

    // --- Lógica de Equipamentos ---
    function displayEquipmentTab() {
        const equipmentArea = document.getElementById("equipment-area");
        if (!equipmentArea) return;
        const existingContent = equipmentArea.querySelector("#equipment-content-wrapper");
        if (existingContent) existingContent.remove();

        const contentWrapper = document.createElement("div");
        contentWrapper.id = "equipment-content-wrapper";
        contentWrapper.style.display = "flex";
        contentWrapper.style.gap = "20px";
        contentWrapper.style.width = "100%";
        contentWrapper.style.maxWidth = "900px";

        const slotsContainer = document.createElement("div");
        slotsContainer.id = "equipment-slots-display";
        slotsContainer.style.border = "1px solid #7f8c8d";
        slotsContainer.style.padding = "10px";
        slotsContainer.style.borderRadius = "5px";
        slotsContainer.style.backgroundColor = "rgba(0,0,0,0.1)";
        slotsContainer.style.width = "350px"; // Aumentar um pouco para comportar mais cartas
        slotsContainer.style.flexShrink = "0";
        slotsContainer.innerHTML = "<h4>Slots Equipados</h4>";

        const armorSlotNames = ["Cabeça", "Peito", "Pernas", "Pés", "Mãos", "Acessório1", "Acessório2"];
        armorSlotNames.forEach(slotName => {
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("equipment-slot-display");
            slotDiv.innerHTML = `<b>${slotName}:</b>`;
            const cardsInSlotDiv = document.createElement("div");
            cardsInSlotDiv.style.display = "flex";
            cardsInSlotDiv.style.gap = "5px";
            cardsInSlotDiv.style.flexWrap = "wrap"; // Para caso exceda o espaço

            const equippedItemIds = playerProfile.equippedArmor[slotName]; // Array de IDs
            if (equippedItemIds && equippedItemIds.length > 0) {
                equippedItemIds.forEach(itemId => {
                    const cardInstance = createCardInstance(itemId);
                    if (cardInstance) {
                        const tempCardEl = cardInstance.getHTMLElement("inventory");
                        tempCardEl.style.width = "50px"; tempCardEl.style.height = "80px"; tempCardEl.style.fontSize = "7px";
                        tempCardEl.style.cursor = "pointer";
                        tempCardEl.title = `Desequipar ${cardInstance.name}`;
                        tempCardEl.onclick = () => unequipItem("armor", slotName, itemId);
                        cardsInSlotDiv.appendChild(tempCardEl);
                    }
                });
            } else {
                cardsInSlotDiv.textContent = "Vazio";
            }
            slotDiv.appendChild(cardsInSlotDiv);
            slotsContainer.appendChild(slotDiv);
        });

        const toolSlotNames = ["Ferramenta1", "Ferramenta2", "Ferramenta3"];
        toolSlotNames.forEach(slotName => {
            const slotDiv = document.createElement("div");
            slotDiv.classList.add("equipment-slot-display");
            const equippedItemId = playerProfile.equippedTools[slotName]; // ID único ou null
            let cardHTML = "Vazio";
            if (equippedItemId) {
                const cardInstance = createCardInstance(equippedItemId);
                if (cardInstance) {
                    const tempCardEl = cardInstance.getHTMLElement("inventory");
                    tempCardEl.style.width = "50px"; tempCardEl.style.height = "80px"; tempCardEl.style.fontSize = "7px";
                    tempCardEl.style.cursor = "pointer";
                    tempCardEl.title = `Desequipar ${cardInstance.name}`;
                    tempCardEl.onclick = () => unequipItem("tool", slotName, equippedItemId);
                    cardHTML = tempCardEl.outerHTML;
                }
            }
            slotDiv.innerHTML = `<b>${slotName}:</b> ${cardHTML}`;
            slotsContainer.appendChild(slotDiv);
        });
        contentWrapper.appendChild(slotsContainer);

        const equippableInventoryContainer = document.createElement("div");
        equippableInventoryContainer.id = "equipment-inventory-display";
        equippableInventoryContainer.style.border = "1px solid #7f8c8d";
        equippableInventoryContainer.style.padding = "10px";
        equippableInventoryContainer.style.borderRadius = "5px";
        equippableInventoryContainer.style.backgroundColor = "rgba(0,0,0,0.1)";
        equippableInventoryContainer.style.flexGrow = "1";
        equippableInventoryContainer.innerHTML = "<h4>Itens Equipáveis no Inventário</h4>";
        const itemsGrid = document.createElement("div");
        itemsGrid.style.display = "flex"; itemsGrid.style.flexWrap = "wrap"; itemsGrid.style.gap = "8px"; itemsGrid.style.justifyContent = "center";
        
        for (const cardId in playerProfile.cardCollection) {
            const cardData = cardDatabase[cardId];
            const collectionInfo = playerProfile.cardCollection[cardId];
            if (cardData && (cardData.type === "Armadura" || cardData.type === "Arma") && collectionInfo.quantity > 0) {
                const cardInstance = createCardInstance(cardId, collectionInfo.level, collectionInfo.xp);
                if (cardInstance) {
                    const cardElement = cardInstance.getHTMLElement("inventory");
                    cardElement.style.width = "70px"; cardElement.style.height = "110px"; 
                    cardElement.style.cursor = "pointer";
                    cardElement.title = `Equipar ${cardInstance.name}`;
                    cardElement.onclick = () => equipItem(cardId);
                    const quantityDisplay = document.createElement("div");
                    quantityDisplay.classList.add("card-quantity");
                    quantityDisplay.textContent = `x${collectionInfo.quantity}`;
                    cardElement.appendChild(quantityDisplay);
                    itemsGrid.appendChild(cardElement);
                }
            }
        }
        equippableInventoryContainer.appendChild(itemsGrid);
        contentWrapper.appendChild(equippableInventoryContainer);
        equipmentArea.appendChild(contentWrapper);
    }

    function equipItem(cardId) {
        const cardData = cardDatabase[cardId];
        if (!cardData) return;

        if (cardData.type === "Armadura") {
            const slotType = cardData.slot;
            if (!playerProfile.equippedArmor.hasOwnProperty(slotType)) {
                logMessage(`Slot de armadura inválido: ${slotType}`);
                return;
            }
            if (playerProfile.equippedArmor[slotType].length < 3) {
                playerProfile.equippedArmor[slotType].push(cardId);
                removeItemFromCollection(cardId, 1, false); 
                logMessage(`${cardData.name} equipado no slot ${slotType}.`);
            } else {
                logMessage(`Slot ${slotType} está cheio (máx. 3 itens).`);
                return;
            }
        } else if (cardData.type === "Arma") {
            const slotType = cardData.slot; 
            if (!playerProfile.equippedTools.hasOwnProperty(slotType)) {
                logMessage(`Slot de ferramenta inválido: ${slotType}`);
                return;
            }
            if (playerProfile.equippedTools[slotType]) { // Se já houver uma ferramenta, desequipa a antiga
                addCardToCollection(playerProfile.equippedTools[slotType], 1);
                logMessage(`${cardDatabase[playerProfile.equippedTools[slotType]].name} desequipado de ${slotType}.`);
            }
            playerProfile.equippedTools[slotType] = cardId;
            removeItemFromCollection(cardId, 1, false); 
            logMessage(`${cardData.name} equipado no slot ${slotType}.`);
        } else {
            logMessage(`${cardData.name} não é um item equipável.`);
            return;
        }
        
        if (battleState.gamePhase !== "setup" && battleState.gamePhase !== "game_over") {
            applyPassiveEquipmentBonuses(battleState.player, playerProfile.equippedArmor, playerProfile.equippedTools);
            updatePlayerStatsUI();
        }
        displayEquipmentTab(); 
        initializePlayerDeck(); 
    }

    function unequipItem(type, slotName, cardIdToUnequip) {
        let itemUnequipped = false;
        if (type === "armor" && playerProfile.equippedArmor[slotName]) {
            const slotArray = playerProfile.equippedArmor[slotName];
            const itemIndex = slotArray.indexOf(cardIdToUnequip);
            if (itemIndex > -1) {
                slotArray.splice(itemIndex, 1);
                addCardToCollection(cardIdToUnequip, 1);
                logMessage(`${cardDatabase[cardIdToUnequip].name} desequipado de ${slotName} e retornado à coleção.`);
                itemUnequipped = true;
            }
        } else if (type === "tool" && playerProfile.equippedTools[slotName] === cardIdToUnequip) {
            playerProfile.equippedTools[slotName] = null;
            addCardToCollection(cardIdToUnequip, 1);
            logMessage(`${cardDatabase[cardIdToUnequip].name} desequipado de ${slotName} e retornado à coleção.`);
            itemUnequipped = true;
        } else {
            logMessage(`Nenhum item correspondente para desequipar no slot ${slotName}.`);
            return;
        }

        if (itemUnequipped) {
            if (battleState.gamePhase !== "setup" && battleState.gamePhase !== "game_over") {
                applyPassiveEquipmentBonuses(battleState.player, playerProfile.equippedArmor, playerProfile.equippedTools);
                updatePlayerStatsUI();
            }
            displayEquipmentTab();
            initializePlayerDeck();
        }
    }
    
    updatePlayerProfileUI();
    showSection("game-area"); 
});

