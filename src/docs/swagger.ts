import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import { auth } from "../lib/auth";

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

  return {
    ...schema,
    info: {
      ...schema.info,
      title: "My API",
      description: "Full API reference powered by Better Auth",
    },
    servers: [{ url: "http://localhost:5000", description: "Local" }],
    tags: [
      {
        name: "Auth",
        description: "Authentication and account endpoints",
      }
    ],
    paths: authPaths,
  };
};

router.use(swaggerUi.serve);

router.get("/", async (req, res, next) => {
  try {
    const schema = await generateOpenAPISchema();

    const html = swaggerUi.generateHTML(schema, {
      customSiteTitle: "My API Docs",
      customCss: `
        .topbar { background-color: #1a1a2e; }
        .topbar-wrapper img { display: none; }
        .topbar-wrapper::after {
          content: 'My API';
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    });

    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
