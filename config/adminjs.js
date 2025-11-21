import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import Blog from "../models/Blog.js";
import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";

AdminJS.registerAdapter(AdminJSMongoose);
const componentLoader = new ComponentLoader();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add custom components
const UploadImageComponent = componentLoader.add(
  "UploadImageComponent",
  path.resolve(__dirname, "../adminjs-components/UploadImage.jsx")
);
const buildAdminRouter = () => {
  const adminJs = new AdminJS({
    componentLoader,
    

    resources: [
      {
        resource: Blog,

        options: {
            listProperties: [
              "blogId",
              "title",
              "authorName",
              "category",
              "status",
              "description",
    "scheduledDate",
  ],
          properties: {
            image: {
              components: {
                edit: UploadImageComponent,
                show: UploadImageComponent,
              },
            },
          },

          editProperties: [
            "name",
            "title",
            "description",
            "category",
            "image",
            "content",
            "metaTitle",
            "metaDescription",
            "keywords",
            "authorName",
            "status",
            "scheduledDate",
          ],

          showProperties: [
            "blogId",
            "name",
            "title",
            "description",
            "category",
            "image",
            "content",
            "metaTitle",
            "metaDescription",
            "keywords",
            "authorName",
            "status",
            "scheduledDate",
            "publishedAt",
          ],
        },
      },
    ],

    rootPath: "/admin",
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      if (email === "codestudios@gmail.com" && password === "admin")
        return { email };
      if (email === "SIPLAdmin@gmail.com" && password === "SIPLAdmin@123!")
        return { email };
      return null;
    },
    cookieName: "adminjs",
    cookiePassword: "yourSecretPassword",
  });

  return { adminJs, adminRouter };
};

export default buildAdminRouter;
