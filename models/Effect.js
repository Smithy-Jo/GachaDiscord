const namesConfig = require('../config/effectNames.json'); 
   
const elements = ['neutral', 'fire', 'water', 'earth'];
const affectedStats = ['hp', 'atk', 'def', 'speed', 'dodge', 'crit'];
const targets = ['self', 'enemy'];


class Effect {
    static knex = null;

    constructor(parameters) {
        // recupaire le niveau de la competance
        // test si le parametre target et affected_stat sont null pour savoir si attaque de base

    }

    // Génération d'un effet aléatoire
    generateRandomEffect() {
        // 



        const element = getRandomElement(elements);
        const affectedStat = Math.random() > 0.5 ? getRandomElement(affectedStats) : null;
        const target = getRandomElement(targets);
        const duration = Math.floor(Math.random() * 5) + 1; // Entre 1 et 5 tours
        const value = Math.floor(Math.random() * 20) + 1;  // Entre 1 et 20

        // Générer un nom aléatoire
        const name = `${getRandomElement(prefixes)} ${getRandomElement(keywords)} ${getRandomElement(suffixes)}`.trim();

        // Générer une description
        let description = '';
        if (affectedStat) {
            description = target === 'self'
                ? `Augmente **${affectedStat}** de **${value}%** pendant **${duration}** tours.`
                : `Diminue **${affectedStat}** de **${value}%** sur l'ennemi pendant **${duration}** tours.`;
        } else {
            description = `Inflige **${value}** dégâts de type **${element}** à l'ennemi.`;
        }

        const effect = {
            name,
            description,
            element,
            affected_stat: affectedStat,
            target,
            duration,
            value
        };
    }

    async save() {
        throw new Error("Not implemented");
    }

    // static async find(id) {
    //     const data = await knex('effects').where('id', id).first();
    //     if (!data) return null;
    //     return new Effect(data);
    // }
}

module.exports = Effect;