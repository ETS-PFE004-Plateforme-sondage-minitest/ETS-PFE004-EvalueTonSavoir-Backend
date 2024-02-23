const Response = require('../helpers/Response.js');
const emailer = require('../config/email.js');
const model = require('../models/users.js');
const jwt = require('../config/jwtToken.js');

class UsersController {

    async register(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return Response.badRequest(res, "Email and password are required.");
        }

        try {
            const user = await model.register(email, password);
            
            if (!user) {
                return Response.badRequest(res, "User already exists.");
            }

            emailer.registerConfirmation(email)

            return Response.ok(res, 'Utilisateur créé avec succès');
        }
        catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return Response.badRequest(res, "Email and password are required.");
        }

        try {
            const user = await model.login(email, password);
            console.log(user);

            if (!user) {
                return Response.badRequest(res, "Email and password does not match.");
            }

            const token = jwt.create(user.email, user._id);

            return Response.ok(res, 
                {
                    token: token,
                    id: user.email
                });
        }
        catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

    async resetPassword(req, res) {
        const { email } = req.body;

        if (!email) {
            return Response.badRequest(res, "Email is required.");
        }

        try {
            const newPassword = await model.resetPassword(email);

            if (!newPassword) {
                throw new Error(res, "Something whent wrong while updating password.")
            }

            emailer.newPasswordConfirmation(email, newPassword);

            return Response.ok(res, "Nouveau mot de passe envoyé par courriel.");

        } catch (e) {
            console.log(e);
            return Response.serverError("");
        }
    }

    async changePassword(req, res) {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return Response.badRequest(res, "Email, oldPassword and newPassword are required.");
        }

        try {
            // verify creds first
            const user = await model.login(email, oldPassword);

            if (!user) {
                return Response.badRequest(res, "Email and password does not match.");
            }

            const password = await model.changePassword(email, newPassword)

            if (!password) {
                throw new Error("Something whent wrong while updating password.")
            }

            return Response.ok(res, "Mot de passe changé avec succès.");

        } catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

    async delete(req, res) {
        const { email, password } = req.body;

        try {
            // verify creds first
            const user = await model.login(email, password);

            if (!user) {
                return Response.badRequest(res, "Email and password does not match.");
            }

            const result = await model.delete(email)

            if (!result) {
                throw new Error("something whent wrong while deleting user.")
            }

            return Response.ok(res, "Utilisateur supprimé avec succès");

        } catch (e) {
            console.log(e);
            return Response.serverError(res, "");
        }
    }

}

module.exports = new UsersController;