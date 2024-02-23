const db = require('../config/db.js');
const bcrypt = require('bcrypt');

class Users {
    async hashPassword(password) {
        return await bcrypt.hash(password, 10)
    }

    generatePassword() {
        return Math.random().toString(36).slice(-8);
    }

    async verify(password, hash) {
        return await bcrypt.compare(password, hash)
    }

    async register(email, password) {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const existingUser = await userCollection.findOne({ email: email });

        if (existingUser) return null;

        const newUser = {
            email: email,
            password: await this.hashPassword(password),
            created_at: new Date()
        };

        const insertResult = await userCollection.insertOne(newUser);

        // TODO: verif if inserted properly...

        return newUser;
    }

    async login(email, password) {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const user = await userCollection.findOne({ email: email });

        if (!user) {
            return false;
        }

        const passwordMatch = await this.verify(password, user.password);

        if (!passwordMatch) {
            return false;
        }

        return user;
    }

    async resetPassword(email) {
        const newPassword = this.generatePassword();

        return await this.changePassword(email, newPassword);
    }

    async changePassword(email, newPassword) {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const hashedPassword = await this.hashPassword(newPassword);

        const result = await userCollection.updateOne({ email }, { $set: { password: hashedPassword } });

        if (result.modifiedCount != 1) return null;

        return newPassword
    }

    async delete(email) {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const result = await userCollection.deleteOne({ email });

        console.log(result)
        if (result.deletedCount != 1) return false;

        return true;
    }

    async getId(email) {
        await db.connect()
        const conn = db.getConnection();

        const userCollection = conn.collection('users');

        const user = await userCollection.findOne({ email: email });

        if (!user) {
            return false;
        }

        console.log(user._id)
        return user._id;
    }

}

module.exports = new Users;