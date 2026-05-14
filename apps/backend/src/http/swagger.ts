export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Aldrava Sesamo API',
    version: '0.1.0',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Healthcheck',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login do morador',
        responses: { 200: { description: 'JWT emitido' }, 401: { description: 'Credenciais invalidas' } },
      },
    },
    '/calls': {
      get: {
        summary: 'Historico de chamadas',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de chamadas' } },
      },
    },
    '/devices/open': {
      post: {
        summary: 'Aciona o portao via ESP32',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Comando enviado' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
