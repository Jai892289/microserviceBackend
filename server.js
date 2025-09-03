const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, password }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


app.post('/user-service', async (req, res) => {
  const { empId, serviceId } = req.body;

  const service = await prisma.user_services.upsert({
    where: {
      empId_serviceId: {
        empId: Number(empId),
        serviceId: Number(serviceId),
      },
    },

    update: {},
    create: {
      empId: Number(empId),
      serviceId: Number(serviceId),
    },
  })
  res.json(service);
})

app.post('/user-data', async (req, res) => {

  try {
    const { id } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        services: {
          include: { service: true },
        },
      },
    });

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

app.listen(3001, () => {
  console.log('User service running on http://localhost:3001');
});
