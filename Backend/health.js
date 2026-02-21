const express = require('express');
const { prisma } = require('./config/databaseConfig');

const app = express();

// Health check endpoint para Railway
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ready check endpoint
app.get('/ready', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM Usuario WHERE activo = true`;
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      users: result[0]?.count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = app;
