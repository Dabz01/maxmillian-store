
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
  } catch (err) {
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
  const { title, price, description } = req.body;
  if (!title || price === undefined) {
    return res.status(400).json({ error: "title and price are required" });
  }
  const newProduct = {
    id: Date.now().toString(),
    title,
    price,
    description: description || ""
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  const { title, price, description } = req.body;
  products[idx] = {
    ...products[idx],
    title: title ?? products[idx].title,
    price: price ?? products[idx].price,
    description: description ?? products[idx].description
  };
  writeProducts(products);
  res.json(products[idx]);
});

app.delete("/api/products/:id", (req, res) => {
  const products = readProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const removed = products.splice(idx, 1)[0];
  writeProducts(products);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Maxmillian server running on http://localhost:${PORT}`);
});
