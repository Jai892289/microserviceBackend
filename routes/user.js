// routes/users.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// const bcrypt = require('bcryptjs');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully (password not returned)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 name: { type: string }
 *                 email: { type: string }
 *       400:
 *         description: Bad request / validation error
 */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password required' });
  }
//   try {
//     const hashed = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, password: hashed },
//     });
//     // remove password before responding
//     const { password: _p, ...safeUser } = user;
//     res.json(safeUser);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (no passwords)
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   email: { type: string }
 */
router.get('/users', async (req, res) => {
  try {
    // select only safe fields to avoid leaking password
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /user-service:
 *   post:
 *     summary: Assign services to a user (multiple)
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [empId, serviceId]
 *             properties:
 *               empId:
 *                 type: integer
 *               serviceId:
 *                 oneOf:
 *                   - type: integer
 *                   - type: array
 *                     items:
 *                       type: integer
 *     responses:
 *       200:
 *         description: assignment result
 */
router.post('/user-service', async (req, res) => {
  const { empId, serviceId } = req.body;
  if (!empId || !serviceId) {
    return res.status(400).json({ message: 'empId and serviceId required' });
  }
  try {
    const ids = Array.isArray(serviceId) ? serviceId.map(Number) : [Number(serviceId)];

    // Option A (recommended): single createMany with skipDuplicates (fast)
    // -- requires unique constraint on (empId, service_id) in your schema
    const data = ids.map((sid) => ({ empId: Number(empId), service_id: sid }));
    const created = await prisma.user_services.createMany({
      data,
      skipDuplicates: true, // will skip existing (works in Postgres/MySQL)
    });
    return res.json({ created });

    // Option B (safe fallback): loop upsert (uncomment if you prefer)
    // const result = await Promise.all(
    //   ids.map(sid =>
    //     prisma.user_services.upsert({
    //       where: { empId_serviceId: { empId: Number(empId), service_id: Number(sid) } },
    //       update: {},
    //       create: { empId: Number(empId), service_id: Number(sid) },
    //     })
    //   )
    // );
    // res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /user-data:
 *   get:
 *     summary: Get user with assigned services
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: user with services
 */
router.get('/user-data', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id query param required' });

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        services: { include: { service: true } }, // keep if your prisma relations are this way
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password: _p, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
