const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "products.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readProducts() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
}

app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

app.post("/api/products", (req, res) => {
  const products = readProducts();
  const { title, price, description, category, featured } = req.body;
  const newProduct = {
    id: Date.now().toString(),
    title,
    price,
    description,
    category: category || "",
    featured: !!featured
  };
  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const existing = products[idx];
  const updated = {
    ...existing,
    ...req.body,
    category: req.body.category !== undefined ? req.body.category : existing.category,
    featured: req.body.featured !== undefined ? !!req.body.featured : existing.featured
  };

  products[idx] = updated;
  writeProducts(products);
  res.json(updated);
});

app.delete("/api/products/:id", (req, res) => {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const removed = products.splice(idx, 1)[0];
  writeProducts(products);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log("Maxmillian running on port " + PORT);
});
