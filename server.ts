import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;
try {
  const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/pizzeria.db' : 'pizzeria.db';
  db = new Database(dbPath);
  console.log(`Database initialized at ${dbPath}`);
} catch (error) {
  console.error("Failed to initialize database. If you are on Vercel, note that local SQLite files are not persistent and native modules like better-sqlite3 might require special configuration.", error);
  // Fallback to memory for demo purposes if it fails
  db = new Database(':memory:');
}

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    image_url TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const contentCount = db.prepare("SELECT COUNT(*) as count FROM site_content").get() as { count: number };
if (contentCount.count === 0) {
  const insertContent = db.prepare("INSERT INTO site_content (key, value) VALUES (?, ?)");
  
  // Hero
  insertContent.run("hero_title", "A Arte da Pizza Perfeita");
  insertContent.run("hero_subtitle", "Descubra o equilíbrio perfeito entre a tradição italiana e os sabores contemporâneos. Cada fatia é uma obra-prima artesanal.");
  insertContent.run("hero_image", "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80");
  
  // About
  insertContent.run("about_title", "Paixão pela Autenticidade");
  insertContent.run("about_text", "Na Pizzaria Prince, acreditamos que a comida é uma linguagem universal de amor. Fundada com o sonho de trazer a verdadeira essência da pizza italiana para Luanda, selecionamos cada ingrediente com rigor — desde a farinha tipo 00 até aos tomates San Marzano.");
  insertContent.run("about_image", "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80");
  
  // Location
  insertContent.run("location_title", "Visite-nos em Cacuaco");
  insertContent.run("location_text", "Estamos situados no coração da Centralidade de Cacuaco, oferecendo um refúgio gastronómico acolhedor e sofisticado.");
  insertContent.run("location_image", "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80");
  
  // Footer
  insertContent.run("footer_description", "A elevar o padrão da pizza em Luanda. Ingredientes selecionados, técnicas tradicionais e uma paixão inabalável pela gastronomia italiana.");
}

const menuCount = db.prepare("SELECT COUNT(*) as count FROM menu").get() as { count: number };
if (menuCount.count === 0) {
  const insertMenu = db.prepare("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)");
  insertMenu.run("Pizza Margherita", "Molho de tomate clássico, mozzarella e manjericão fresco.", 12.99, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80", "Pizza");
  insertMenu.run("Festa de Pepperoni", "Dobro de pepperoni com mozzarella extra.", 14.99, "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80", "Pizza");
  insertMenu.run("Especial Prince", "A favorita do chef com uma mistura de tudo um pouco.", 16.99, "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", "Pizza");
}

const reviewCount = db.prepare("SELECT COUNT(*) as count FROM reviews").get() as { count: number };
if (reviewCount.count === 0) {
  const insertReview = db.prepare("INSERT INTO reviews (author, content, rating, date) VALUES (?, ?, ?, ?)");
  insertReview.run("Francisco Catarino", "Gostei muito da Pizzaria e gostaria que as pessoas gostassem de saborear também as especiarias dela.", 5, "há 8 anos");
  insertReview.run("Miguel da Costa", "Pizza razoável, boa localização, preços ajustados à realidade.", 4, "há 6 anos");
}

export const app = express();
app.use(express.json());

// Multer setup for image uploads
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads';
const upload = multer({ dest: uploadDir });
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// API Routes
app.get("/api/menu", (req, res) => {
  const menu = db.prepare("SELECT * FROM menu").all();
  res.json(menu);
});

app.post("/api/menu", (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  const info = db.prepare("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)").run(name, description, price, image_url, category);
  res.json({ id: info.lastInsertRowid });
});

app.put("/api/menu/:id", (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  db.prepare("UPDATE menu SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?").run(name, description, price, image_url, category, req.params.id);
  res.json({ success: true });
});

app.delete("/api/menu/:id", (req, res) => {
  db.prepare("DELETE FROM menu WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/reviews", (req, res) => {
  const reviews = db.prepare("SELECT * FROM reviews ORDER BY id DESC").all();
  res.json(reviews);
});

app.get("/api/content", (req, res) => {
  const content = db.prepare("SELECT * FROM site_content").all();
  const contentMap = (content as any[]).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
  res.json(contentMap);
});

app.post("/api/content", (req, res) => {
  const { key, value } = req.body;
  db.prepare("INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)").run(key, value);
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "braulio@gmail.com" && password === "vendas") {
    res.json({ success: true, token: "mock-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

app.post("/api/upload", upload.single("image"), (req: any, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  res.json({ url: `/uploads/${req.file.filename}` });
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
