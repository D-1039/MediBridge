const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MediBridge API",
      version: "1.0.0",
      description:
        "Medicine redistribution platform API. OCR assists extraction; pharmacists have final approval authority.",
      contact: { name: "MediBridge Team" },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            full_name: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              enum: ["donor", "receiver", "pharmacist", "admin"],
            },
          },
        },
        Medicine: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            medicine_name: { type: "string" },
            dosage: { type: "string" },
            batch_number: { type: "string" },
            expiry_date: { type: "string", format: "date" },
            quantity: { type: "integer" },
            image_url: { type: "string" },
            ocr_confidence: { type: "number" },
            safety_score: { type: "integer" },
            status: { type: "string" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication & registration" },
      { name: "Medicines", description: "Donation marketplace & upload" },
      { name: "Pharmacist", description: "Verification workflow" },
      { name: "Requests", description: "Receiver donation requests" },
      { name: "Analytics", description: "Platform statistics" },
    ],
  },
  apis: [
    "./src/routes/*.js",
    "./src/docs/paths.yaml",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
