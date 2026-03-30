const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); 

const JWT_SECRET = 'my_super_secure_secret_key_123'; 
const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

describe('Agents API Endpoints', () => {
    
    let adminToken;
    let standardUserToken;
    let agentToken;
    let brandNewUserToken;

    beforeAll(() => {
        adminToken = generateToken({ ID: 1, role: 'admin' });
        standardUserToken = generateToken({ ID: 2, role: 'user', agent_id: 999 });
        agentToken = generateToken({ ID: 3, role: 'agent', agent_id: 1 });
        brandNewUserToken = generateToken({ ID: 4, role: 'user' });
    });

    // Create Agent
    describe('POST /api/v1/agents', () => {
        const newAgent = {
            agency_name: "Test Agency UK",
            phone_number: "07123456789",
            license_number: "LIC-TEST-001"
        };

        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app.callback())
                .post('/api/v1/agents')
                .send(newAgent);

            expect(response.status).toBe(401);
        });

        it('should return 201 Created when a logged-in user creates a profile', async () => {
            const response = await request(app.callback())
                .post('/api/v1/agents')
                .set('Authorization', `Bearer ${brandNewUserToken}`)
                .send(newAgent); 

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('created', true);
        });
    });

    // Get All Agents
    describe('GET /api/v1/agents', () => {
        it('should return 403 Forbidden if a non-admin tries to view all agents', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toMatch(/Only admins/i);
        });

        it('should return 200 OK and a list of agents for an Admin', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // Get Agent by ID
    describe('GET /api/v1/agents/:id', () => {
        it('should return 404 Not Found for a non-existent agent', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents/8888')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
        });

        it('should return 200 OK when requesting an existing agent', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents/1')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
        });
    });

    // Get Agent Properties
    describe('GET /api/v1/agents/:id/properties', () => {
        it('should return 403 Forbidden if a user tries to view another agent\'s properties', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents/1/properties') 
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 200 OK and a list of properties for the authorized agent', async () => {
            const response = await request(app.callback())
                .get('/api/v1/agents/1/properties')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // Update Agent Profile
    describe('PUT /api/v1/agents/:id', () => {
        it('should return 403 Forbidden if trying to update someone else\'s profile', async () => {
            const response = await request(app.callback())
                .put('/api/v1/agents/1')
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send({ agency_name: "Hacked Agency" });

            expect(response.status).toBe(403);
        });

        it('should return 200 OK when an agent updates their own profile', async () => {
            const response = await request(app.callback())
                .put('/api/v1/agents/1')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({ agency_name: "Prime EstatesUpd" });

            expect(response.status).toBe(200);
        });
    });

    // Approve/Suspend Agent
    describe('PATCH /api/v1/agents/:id/approve & /suspend', () => {
        
        it('should return 403 Forbidden if a non-admin tries to approve an agent', async () => {
            const response = await request(app.callback())
                .patch('/api/v1/agents/999/approve')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 200 OK when an Admin approves an agent', async () => {
            const response = await request(app.callback())
                .patch('/api/v1/agents/999/approve') 
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });

        it('should return 200 OK when an Admin suspends an agent', async () => {
            const response = await request(app.callback())
                .patch('/api/v1/agents/1/suspend') 
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });
    });
});