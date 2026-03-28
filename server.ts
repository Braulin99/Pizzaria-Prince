import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/pizzeria.db' : 'pizzeria.db';

// On Vercel, copy the bundled database to /tmp for write access if it doesn't exist
if (process.env.NODE_ENV === 'production' && !fs.existsSync(dbPath)) {
  const bundledDbPath = path.resolve(process.cwd(), 'pizzeria.db');
  const altBundledDbPath = path.resolve(__dirname, 'pizzeria.db');
  
  console.log(`Checking for bundled database at: ${bundledDbPath} or ${altBundledDbPath}`);
  
  let sourcePath = '';
  if (fs.existsSync(bundledDbPath)) {
    sourcePath = bundledDbPath;
  } else if (fs.existsSync(altBundledDbPath)) {
    sourcePath = altBundledDbPath;
  }

  if (sourcePath) {
    try {
      fs.copyFileSync(sourcePath, dbPath);
      console.log(`Successfully copied bundled database from ${sourcePath} to ${dbPath}`);
    } catch (copyError) {
      console.error('Failed to copy bundled database:', copyError);
    }
  } else {
    console.error(`Bundled database not found. Current directory: ${process.cwd()}, __dirname: ${__dirname}`);
    try {
      console.log('Files in current directory:', fs.readdirSync(process.cwd()));
      if (fs.existsSync(path.join(process.cwd(), 'api'))) {
        console.log('Files in api directory:', fs.readdirSync(path.join(process.cwd(), 'api')));
      }
    } catch (e) {}
  }
}

const db = new sqlite3.Database(dbPath);

// Helper to run queries as promises
const dbRun = (query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (query: string, params: any[] = []) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      image_url TEXT,
      category TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER,
      date TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      caption TEXT,
      "order" INTEGER DEFAULT 0
    );
  `);

  // Seed initial data if empty
  db.get("SELECT COUNT(*) as count FROM site_content", async (err, row: any) => {
    if (!err && row.count === 0) {
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["hero_title", "A Arte da Pizza Perfeita"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["hero_subtitle", "Descubra o equilíbrio perfeito entre a tradição italiana e os sabores contemporâneos. Cada fatia é uma obra-prima artesanal."]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["hero_image", "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["about_title", "Paixão pela Autenticidade"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["about_text", "Na Pizzaria Prince, acreditamos que a comida é uma linguagem universal de amor. Fundada com o sonho de trazer a verdadeira essência da pizza italiana para Luanda, selecionamos cada ingrediente com rigor — desde a farinha tipo 00 até aos tomates San Marzano."]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["about_image", "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["location_title", "Visite-nos em Cacuaco"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["location_text", "Estamos situados no coração da Centralidade de Cacuaco, oferecendo um refúgio gastronómico acolhedor e sofisticado."]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["location_image", "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"]);
      await dbRun("INSERT INTO site_content (key, value) VALUES (?, ?)", ["footer_description", "A elevar o padrão da pizza em Luanda. Ingredientes selecionados, técnicas tradicionais e uma paixão inabalável pela gastronomia italiana."]);
    }
  });

  db.get("SELECT COUNT(*) as count FROM menu", async (err, row: any) => {
    if (!err && row.count === 0) {
      await dbRun("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)", ["Pizza Margherita", "Molho de tomate clássico, mozzarella e manjericão fresco.", 12.99, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80", "Pizza"]);
      await dbRun("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)", ["Festa de Pepperoni", "Dobro de pepperoni com mozzarella extra.", 14.99, "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80", "Pizza"]);
      await dbRun("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)", ["Especial Prince", "A favorita do chef com uma mistura de tudo um pouco.", 16.99, "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", "Pizza"]);
    }
  });

  db.get("SELECT COUNT(*) as count FROM reviews", async (err, row: any) => {
    if (!err && row.count === 0) {
      await dbRun("INSERT INTO reviews (author, content, rating, date) VALUES (?, ?, ?, ?)", ["Francisco Catarino", "Gostei muito da Pizzaria e gostaria que as pessoas gostassem de saborear também as especiarias dela.", 5, "há 8 anos"]);
      await dbRun("INSERT INTO reviews (author, content, rating, date) VALUES (?, ?, ?, ?)", ["Miguel da Costa", "Pizza razoável, boa localização, preços ajustados à realidade.", 4, "há 6 anos"]);
    }
  });
});

export const app = express();
app.use(express.json());

// Multer setup for image uploads
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : 'uploads';
const upload = multer({ dest: uploadDir });
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// API Routes
app.get("/api/health", async (req, res) => {
  try {
    const test = await dbGet("SELECT 1 as test");
    res.json({ 
      status: "ok", 
      db: !!db, 
      dbTest: test,
      env: process.env.NODE_ENV,
      cwd: process.cwd(),
      dirname: __dirname
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/menu", async (req, res) => {
  try {
    const menu = await dbAll("SELECT * FROM menu");
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body;
    const result: any = await dbRun("INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)", [name, description, price, image_url, category]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put("/api/menu/:id", async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body;
    await dbRun("UPDATE menu SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?", [name, description, price, image_url, category, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/menu/:id", async (req, res) => {
  try {
    await dbRun("DELETE FROM menu WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await dbAll("SELECT * FROM reviews ORDER BY id DESC");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    const content = await dbAll("SELECT * FROM site_content");
    const contentMap = content.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    res.json(contentMap);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/content/raw", async (req, res) => {
  try {
    const content = await dbAll("SELECT * FROM site_content");
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/content", async (req, res) => {
  try {
    const { key, value } = req.body;
    await dbRun("INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)", [key, value]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put("/api/content/:key", async (req, res) => {
  try {
    const { value } = req.body;
    await dbRun("UPDATE site_content SET value = ? WHERE key = ?", [value, req.params.key]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/content/:key", async (req, res) => {
  try {
    await dbRun("DELETE FROM site_content WHERE key = ?", [req.params.key]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/gallery", async (req, res) => {
  try {
    const gallery = await dbAll("SELECT id, url as imageUrl, caption as alt, \"order\" FROM gallery ORDER BY \"order\" ASC");
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/gallery", async (req, res) => {
  try {
    const { imageUrl, alt, order } = req.body;
    await dbRun("INSERT INTO gallery (url, caption, \"order\") VALUES (?, ?, ?)", [imageUrl, alt, order || 0]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put("/api/gallery/:id", async (req, res) => {
  try {
    const { imageUrl, alt, order } = req.body;
    await dbRun("UPDATE gallery SET url = ?, caption = ?, \"order\" = ? WHERE id = ?", [imageUrl, alt, order || 0, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    await dbRun("DELETE FROM gallery WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
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
