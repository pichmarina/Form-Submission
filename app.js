const express = require("express");
const path = require("path");
const fs = require("fs");
const multiparty = require("multiparty");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get("/", (req, res) => {
  res.redirect("/register");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error parsing form.");
    }

    const name = fields.fullName?.[0];
    const email = fields.email?.[0];
    const course = fields.course?.[0];

    if (!files.profilePic || files.profilePic.length === 0) {
      return res.send("No file uploaded.");
    }

    const uploadedFile = files.profilePic[0];

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(uploadedFile.headers["content-type"])) {
      return res.send("Only JPG and PNG files are allowed.");
    }

    const tempPath = uploadedFile.path;
    const fileName = Date.now() + "-" + uploadedFile.originalFilename;
    const newPath = path.join(uploadDir, fileName);

    fs.rename(tempPath, newPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving file.");
      }

      res.render("profile", {
        name,
        email,
        course,
        imagePath: "/uploads/" + fileName,
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});