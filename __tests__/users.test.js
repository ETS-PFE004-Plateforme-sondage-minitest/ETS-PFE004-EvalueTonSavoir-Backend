const http = require("http");
const request = require('supertest');




process.env.NODE_ENV = "test";

const BACKEND_PORT = 4400;
const BACKEND_URL = "http://localhost";

const BACKEND_API = `${BACKEND_URL}:${BACKEND_PORT}`;

const ROUTE = `${BACKEND_API}/user`

const register = "/register";
const login = "/login";
const resetPassword = "/reset-password";
const changePassword = "/change-password";
const deleteUser = "/delete-user";


describe("websocket server", () => {

    test('POST /api/login should return 200 OK', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword',
            });

        expect(response.statusCode).toBe(200);
        // Add more assertions based on your application logic
    });


});