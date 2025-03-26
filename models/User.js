const { knex } = require("./Effect");
const Character = require("./Character");

class User {
    static knex = null;

    constructor(parameters) {
        // Variable de la base de données
        this.id = parameters.id ?? null; // Discord user ID
        this.username = parameters.username ?? null;
        this.email = parameters.email !== "" ? parameters.email : null;
        this.password = parameters.password ?? null;
        this.balance = parameters.balance ?? 1000;
        this.total_summons = parameters.total_summons ?? 0;
        this.epic_pity = parameters.epic_pity ?? 0;
        this.legendary_pity = parameters.legendary_pity ?? 0;

        // Variables propres à l'objet
        this.characters = parameters.characters ?? [];
    }

    static async getUserById(user_id) {
        const user = await User.knex('users').where('id', user_id).first();
        if (!user) return null;
        return new User(user);
    }

    static async create(parameters) {
        const user = new User(parameters);

        await User.knex('users').insert({
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            balance: user.balance,
            total_summons: user.total_summons,
            epic_pity: user.epic_pity,
            legendary_pity: user.legendary_pity,
            created_at: new Date(),
            updated_at: new Date()
        });

        return user;
    }

    static async deleteUser(user_id) {
        return User.knex('users').where('id', user_id).del();
    }

    async save() {
        return User.knex('users').where('id', this.id).update({
            username: this.username,
            email: this.email,
            password: this.password,
            balance: this.balance,
            total_summons: this.total_summons,
            epic_pity: this.epic_pity,
            legendary_pity: this.legendary_pity,
            updated_at: new Date()
        });
    }

    async updatePitySystem(obtainedRarity) {

        // Mise à jour du système de pitié
        if (obtainedRarity === 'legendary') {
            this.epic_pity = 0;
            this.legendary_pity = 0;
        } else if (obtainedRarity === 'epic') {
            this.epic_pity = 0;
        } else {
            this.epic_pity += 1;
            this.legendary_pity += 1;
        }
    }

    async getCharacters() {
        const characters = await User.knex('characters').where('user_id', this.id).select();
        return characters.map(character => new Character(character));
    }
}

module.exports = User;