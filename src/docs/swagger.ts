import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import { auth } from "../lib/auth";
import { schemas } from "./schemas";
import { customPaths, customTags } from "./paths";

const router = Router();

const withAuthPrefix = (path: string) => {
  if (path.startsWith("/api/auth")) {
    return path;
  }

  return `/api/auth${path.startsWith("/") ? path : `/${path}`}`;
};

const withAuthTag = (pathConfig: unknown) => {
  if (!pathConfig || typeof pathConfig !== "object") {
    return pathConfig;
  }

  return Object.fromEntries(
    Object.entries(pathConfig).map(([method, config]) => {
      if (!config || typeof config !== "object") {
        return [method, config];
      }

      return [method, { ...config, tags: ["Auth"] }];
    }),
  );
};

export const generateOpenAPISchema = async () => {
  const schema = await auth.api.generateOpenAPISchema();
  const authPaths = Object.fromEntries(
    Object.entries(schema.paths ?? {}).map(([path, config]) => [
      withAuthPrefix(path),
      withAuthTag(config),
    ]),
  );

  const serverUrl =
    process.env.BETTER_AUTH_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : "");

  return {
    ...schema,
    openapi: schema.openapi || "3.1.0",
    info: {
      title: "Completeme API",
      version: "1.0.0",
      description:
        "Comprehensive API reference for completeme — a full-featured e-commerce platform powering multi-vendor marketplaces, product catalog, cart & checkout, order tracking, payments, shipments, and customer account management.",
      contact: {
        name: "Completeme API Support",
      },
    },
    servers: [
      {
        url: serverUrl,
        description: "API server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description:
          "Authentication and account management endpoints powered by Better Auth",
      },
      ...customTags,
    ],
    paths: {
      ...authPaths,
      ...customPaths,
    },
    components: {
      ...schema.components,
      securitySchemes: {
        ...schema.components?.securitySchemes,
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your session token as a Bearer token: Bearer <session_token>",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Better Auth session cookie sent automatically with browser credentials.",
        },
      },
      schemas: {
        ...schema.components?.schemas,
        ...schemas,
      },
    },
  };
};

router.use(swaggerUi.serve);

router.get("/", async (req, res, next) => {
  try {
    const schema = await generateOpenAPISchema();

    const html = swaggerUi.generateHTML(schema, {
      customSiteTitle: "completeme API Documentation",
      customCss: `
        .topbar { background-color: #0f172a; padding: 12px 0; }
        .topbar-wrapper img { display: none; }
        .topbar-wrapper::after {
          content: '⚡ completeme API Reference';
          color: #f8fafc;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .swagger-ui .info { margin: 25px 0; }
        .swagger-ui .info .title { font-size: 2.2rem; color: #0f172a; }
        .swagger-ui .opblock-tag { font-size: 1.15rem; font-weight: 600; }
        .swagger-ui .btn.authorize { background-color: #4f46e5; border-color: #4f46e5; color: white; }
        .swagger-ui .btn.authorize svg { fill: white; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        docExpansion: "none",
        tagsSorter: "alpha",
      },
    });

    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
