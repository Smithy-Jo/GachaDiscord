class PvECombat {
    constructor(player, enemy, message) {
        this.player = player;
        this.enemy = enemy;
        this.logs = [];
        this.message = message;
        this.round = 0;
    }

    async log(action) {
        this.logs.push(action);
        let content = this.logs.join('\n');
    
        try {
            // Tente de mettre à jour le message existant
            await this.message.edit({ content, components: [] });
        } catch (error) {
            if (error.rawError && error.rawError.errors && error.rawError.errors.content) {
                this.logs = [action];
                content = this.logs.join('\n');
                this.message = await this.message.channel.send({ content, components: [] });
            } else {
                throw error;
            }
        }
    }
    

    async start() {
        await this.log(`Début du combat entre ${this.player.name} et ${this.enemy.name} !`);
        // Tant que les deux personnages ont des PV
        while (this.player.hp > 0 && this.enemy.hp > 0) {
            this.round++;
            await this.log(`--- Tour ${this.round} ---`);
            await this.playerTurn();
            if (this.enemy.hp <= 0) break;
            await this.enemyTurn();
            // Mise à jour des effets actifs en fin de tour pour chaque personnage
            this.player.updateEffects();
            this.enemy.updateEffects();
            this.player.decrementCooldowns();
            this.enemy.decrementCooldowns();
            
        }
        if (this.player.hp > 0) {
            await this.log(`${this.player.name} a gagné !`);
            return this.player;
        } else {
            await this.log(`${this.enemy.name} a gagné !`);
            return this.enemy;
        }
    }


    async playerTurn() {
        await this.performSkill(this.player, this.enemy);
    }

    async enemyTurn() {
        await this.performSkill(this.enemy, this.player);
    }

    async performSkill(attacker, defender) {
        // Choisir la compétence à utiliser
        const skill = attacker.ultimateSkill?.isAvailable() ? attacker.ultimateSkill :
            attacker.specialSkill?.isAvailable() ? attacker.specialSkill :
                attacker.basicSkill;

        // Appliquer les effets destinés au lanceur (self)
        for (const effect of skill.effects) {
            if (effect.target === 'self') {
                // Ici, on peut appliquer un buff (buff positif) sur le lanceur
                attacker.applyEffect(effect);
                await this.log(`${attacker.name} utilise ${effect.name} et augmente son ${effect.affected_stat} de ${effect.value} pendant ${effect.duration} tours !`);
            } else if (effect.target === 'enemy') {
                // Pour les effets visant l'ennemi, vérifier d'abord l'esquive
                if (Math.random() * 100 <= defender.dodge) {
                    await this.log(`${defender.name} esquive ${effect.name} de ${attacker.name} !`);
                } else {
                    defender.applyEffect({
                        ...effect,
                        value: this.calculateEffectiveDamage(effect, defender),
                    });
                    await this.log(`${attacker.name} utilise ${effect.name} et diminue le ${effect.affected_stat} de ${defender.name} de ${effect.value} pendant ${effect.duration} tours !`);
                }
            }
            if (skill.cooldown > 0) {
                skill.cooldown_remaining = skill.cooldown;
            }
        }


    }

    calculateEffectiveDamage(effect, defender) {
        const element = effect.element;

        // Récupérer la résistance pour l'élément concerné sur le défenseur
        const resistances = defender.resistances || { fire: 0, water: 0, earth: 0 };
        const resistance = resistances[element] || 0;

        // Appliquer la réduction due à la résistance élémentaire
        let damageAfterResistance = effect.value * (1 - resistance);

        // Appliquer la défense du défenseur (soustraction de la valeur de la défense)
        let finalDamage = Math.max(damageAfterResistance - defender.def, 0);

        return -finalDamage;
    }


}

module.exports = PvECombat;