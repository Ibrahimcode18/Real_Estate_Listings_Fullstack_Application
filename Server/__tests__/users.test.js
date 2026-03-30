const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); 

const JWT_SECRET = 'my_super_secure_secret_key_123'; 
const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

describe('Users API Endpoints', () => {
    
    let adminToken;
    let standardUserToken;

    beforeAll(() => {
        adminToken = generateToken({ ID: 1, role: 'admin' });
        standardUserToken = generateToken({ ID: 2, role: 'user' });
    });

    // Create User
    describe('POST /api/v1/users', () => {
        const newUser = {
            username: "newTestUser",
            email: "newuser@test.com",
            password: "Password123!",
            first_name: "Test",
            last_name: "User"
        };

        it('should return 201 Created when valid data is submitted', async () => {
            const response = await request(app.callback())
                .post('/api/v1/users')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('created', true);
        });

        it('should return 409 Conflict if username or email already exists', async () => {
            const response = await request(app.callback())
                .post('/api/v1/users')
                .send(newUser);

            expect(response.status).toBe(409);
            expect(response.body.message).toMatch(/already exists/i);
        });
    });

    // Get All Users
    describe('GET /api/v1/users', () => {
        it('should return 403 Forbidden if a standard user tries to view all users', async () => {
            const response = await request(app.callback())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toMatch(/Only admins/i);
        });

        it('should return 200 OK and a list of users for an Admin', async () => {
            const response = await request(app.callback())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            
            // Security Check: Ensure passwords are not leaked!
            expect(response.body[0]).not.toHaveProperty('password_hash');
            expect(response.body[0]).not.toHaveProperty('password');
        });
    });

    // Get User by ID
    describe('GET /api/v1/users/:id', () => {
        it('should return 200 OK when a user requests their own profile', async () => {
            const response = await request(app.callback())
                .get('/api/v1/users/2') // User 2 requesting User 2
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('username', 'standardUser');
        });

        it('should return 403 Forbidden if a standard user tries to view someone else', async () => {
            const response = await request(app.callback())
                .get('/api/v1/users/1') // User 2 requesting User 1
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 Not Found for a non-existent user', async () => {
            const response = await request(app.callback())
                .get('/api/v1/users/9999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });
    });

    // Update User
    describe('PUT /api/v1/users/:id', () => {
        it('should return 200 OK when a user updates their own profile', async () => {
            const response = await request(app.callback())
                .put('/api/v1/users/2')
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send({ first_name: "UpdatedName" });

            expect(response.status).toBe(200);
        });

        it('should return 403 Forbidden if a standard user tries to update someone else', async () => {
            const response = await request(app.callback())
                .put('/api/v1/users/1') // User 2 trying to edit User 1
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send({ first_name: "HackedName" });

            expect(response.status).toBe(403);
        });
    });

   // User Login
    describe('POST /api/v1/users/login', () => {
        it('should return 401 Unauthorized if no credentials are provided', async () => {
            const response = await request(app.callback())
                .post('/api/v1/users/login');

            expect(response.status).toBe(401); 
        });

        // The Happy Path (Success)
        it('should return 200 OK and a JWT token for valid credentials', async () => {
            const response = await request(app.callback())
                .post('/api/v1/users/login')
                .auth('newTestUser', 'Password123!'); 

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token'); 
            expect(response.body.user).toHaveProperty('username', 'newTestUser');
        });
    });

});