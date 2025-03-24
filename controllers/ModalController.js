const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = {
    async register(interaction) {
        const email = interaction.fields.getTextInputValue('emailInput');
        const password = interaction.fields.getTextInputValue('passwordInput');
        const confPassword = interaction.fields.getTextInputValue('confPasswordInput');

        // Verification de l'email
        if (email !== "" && !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            return interaction.reply('L\'adresse email n\'est pas valide.');
        }

        // Verification de la correspondance des mots de passe
        if (password !== confPassword) {
            return interaction.reply('Les mots de passe ne correspondent pas.');
        }

        // Enregistrement de l'utilisateur
        try {
            await User.create({
                id: interaction.user.id,
                username: interaction.user.username,
                email: email,
                password: bcrypt.hashSync(password, 10),
                balance: 1000,
            });

            return interaction.reply('Vous êtes maintenant enregistré!');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return interaction.reply('Cet email est déjà utilisé.');
            } else {
                console.error(error);
                return interaction.reply('Une erreur est survenue lors de l\'enregistrement.\n Contactez un administrateur.');
            };
        }
    },
    async unregister(interaction) {
        const password = interaction.fields.getTextInputValue('passwordInput');
        const user = await User.getUserById(interaction.user.id);
        // Verification du mot de passe
        if (!bcrypt.compareSync(password, user.password)) {
            return interaction.reply('Mot de passe incorrect.');
        }

        // Suppression de l'utilisateur
        try {
            await User.deleteUser(interaction.user.id);
            return interaction.reply('Votre compte a été supprimé.');
        } catch (error) {
            console.error(error);
            return interaction.reply('Une erreur est survenue lors de la suppression de votre compte.\n Contactez un administrateur.');
        }
    }
}