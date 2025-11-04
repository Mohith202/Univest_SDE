import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Meetings API",
      version: "1.0.0",
      description: "API for creating and listing meeting summaries",
    },
    servers: [
      { url: "http://localhost:3000" },
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
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
        },
        Meeting: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            transcript: { type: "string" },
            summary: { type: "string", nullable: true },
            actionItems: { type: "array", items: { type: "string" } },
            embedding: { type: "array", items: { type: "number" }, nullable: true },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateMeetingRequest: {
          type: "object",
          required: ["title", "transcript"],
          properties: {
            title: { type: "string" },
            transcript: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);


