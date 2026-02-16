import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Airport Ride Pooling API',
      version: '1.0.0',
      description: 'API for managing airport ride pooling, including matching, pricing, and concurrency control.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    components: {
      schemas: {
        RideRequest: {
          type: 'object',
          required: ['pickup', 'dropoff', 'passengers'],
          properties: {
            pickup: {
              type: 'object',
              properties: {
                lat: { type: 'number', minimum: -90, maximum: 90 },
                lng: { type: 'number', minimum: -180, maximum: 180 },
              },
            },
            dropoff: {
              type: 'object',
              properties: {
                lat: { type: 'number', minimum: -90, maximum: 90 },
                lng: { type: 'number', minimum: -180, maximum: 180 },
              },
            },
            passengers: { type: 'integer', minimum: 1, maximum: 4 },
            luggageCount: { type: 'integer', minimum: 0, maximum: 4 },
          },
        },
        RideResponse: {
          type: 'object',
          properties: {
            rideRequestId: { type: 'string', format: 'uuid' },
            groupId: { type: 'string', format: 'uuid' },
            status: { type: 'string' },
            fare: { type: 'number' },
            isShared: { type: 'boolean' },
            etaMins: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/ride/*.routes.ts', './src/modules/ride/*.routes.js'], // Look for annotations in route files
};

export const swaggerSpec = swaggerJsdoc(options);
