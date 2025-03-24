const { knex } = require("./Effect");

class User {
    static knex = null;

    constructor(parameters) {
        this.id = parameters.id; // Discord user ID
        this.username = parameters.username;
        this.email = parameters.email === "" ? null : parameters.email;
        this.password = parameters.password;
        this.balance = parameters.balance;
        this.total_summons = parameters.total_summons ? parameters.total_summons : 0;
        this.epic_pity = parameters.epic_pity ? parameters.epic_pity : 0;
        this.legendary_pity = parameters.legendary_pity ? parameters.legendary_pity : 0;
    }

    static async getUserById(user_id) {
        const user = await User.knex('users').where('id', user_id).first();
        if (!user) return null;

        return new User(user);
    }

    static async create(parameters) {
        await User.knex('users').insert({
            id: parameters.id,
            username: parameters.username,
            email: parameters.email === "" ? null : parameters.email,
            password: parameters.password,
            balance: parameters.balance,
            total_summons: parameters.total_summons,
            epic_pity: parameters.epic_pity,
            legendary_pity: parameters.legendary_pity,
            created_at: new Date(),
            updated_at: new Date()
        });

        return new User(parameters);
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
}

module.exports = User;