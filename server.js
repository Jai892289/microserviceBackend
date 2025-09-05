// const express = require('express');
// const { PrismaClient } = require('@prisma/client');

// const swaggerUi = require("swagger-ui-express");
// const swaggerJsdoc = require("swagger-jsdoc");


// require('dotenv').config();

// const app = express();
// const prisma = new PrismaClient();

// app.use(express.json());



// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "My API",
//       version: "1.0.0",
//       description: "API documentation using Swagger (OpenAPI 3.0)",
//     },
//     servers: [
//       {
//         url: "http://localhost:5000", // update if deploying
//       },
//     ],
//   },
//   apis: ["./routes/*.js"], // path to files with API docs
// };

// const swaggerSpec = swaggerJsdoc(swaggerOptions);

// // Swagger route
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// app.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const user = await prisma.user.create({
//       data: { name, email, password }
//     });
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.json(users);
// });


// app.post('/user-service', async (req, res) => {
//   const { empId, serviceId } = req.body;

//   // const service = await prisma.user_services.upsert({
//   //   where: {
//   //     empId_serviceId: {
//   //       empId: Number(empId),
//   //       serviceId: Number(serviceId),
//   //     },
//   //   },

//   //   update: {},
//   //   create: {
//   //     empId: Number(empId),
//   //     serviceId: Number(serviceId),
//   //   },
//   // })

//   const service = await Promise.all(
//   serviceId.map((sid) =>
//     prisma.user_services.upsert({
//       where: {
//         employeeid_service_id: { empId: Number(empId), service_id: sid },
//       },
//       update: {},
//       create: { empId: Number(empId), service_id: sid },
//     })
//   )
// );

//   res.json(service);
// })

// app.post('/user-data', async (req, res) => {

//   try {
//     const { id } = req.query;

//     const user = await prisma.user.findUnique({
//       where: { id: Number(id) },
//       include: {
//         services: {
//           include: { service: true },
//         },
//       },
//     });

//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// })

// app.listen(3001, () => {
//   console.log('User service running on http://localhost:3001');
// });




const express = require('express');
const { PrismaClient } = require('@prisma/client');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
dotenv.config();

const prisma = new PrismaClient();
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation using Swagger (OpenAPI 3.0)',
    },
    servers: [{ url: 'http://localhost:3001' }], // update if you change port
    tags: [
      { name: 'Users', description: 'Operations related to users' },
      { name: 'Services', description: 'Assigning and listing services' },
    ],
  },
  apis: ['./routes/*.js'], // load JSDoc comments from routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// only expose swagger in development (safer)
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Mount routes
app.use('/', userRoutes);

// Generic error handler (place after routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`User service running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  }
});

// Graceful prisma disconnect
const shutdown = async () => {
  console.log('Shutting down — disconnecting Prisma...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
