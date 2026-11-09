const express = require('express');
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'cars.json');
const read = () => JSON.parse(fs.readFileSync(FILE, 'utf8'));
const write = (cars) => fs.writeFileSync(FILE, JSON.stringify(cars, null, 2));
const app = express();
app.use(express.json());
//! cors da tog'irlab keting
const cors = require('cors');
app.use(cors({ origin: 'http://127.0.0.1:5500' })); // frontend dev server

app.get('/api/cars', (req, res) => res.status(200).json(read()));

app.post('/api/cars', (req, res) => {
  const { brand, model, year, price, img } = req.body || {};
  if (!brand || !model || price == null) {
    return res.status(400).json({ error: 'brand, model and price are required' });
  }
  const cars = read();
  // ponytail: max id + 1, sync fs; use a real DB if concurrent writes matter
  const car = { id: Math.max(0, ...cars.map((c) => c.id)) + 1, brand, model, year, price, img };
  cars.push(car);
  write(cars);
  res.status(201).json(car);
});

app.put('/api/cars/:id', (req, res) => {
  const cars = read();
  const car = cars.find((c) => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error: 'Car not found' });
  Object.assign(car, req.body, { id: car.id });
  write(cars);
  res.status(200).json(car);
});

app.delete('/api/cars/:id', (req, res) => {
  const cars = read();
  const i = cars.findIndex((c) => c.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Car not found' });
  const [removed] = cars.splice(i, 1);
  write(cars);
  res.status(200).json(removed);
});

// GET /api/cars/:id — needed for "DELETE then GET same id → 404"
app.get('/api/cars/:id', (req, res) => {
  const car = read().find((c) => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.status(200).json(car);
});

// typo URLs like /api/cras
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(3000, () => console.log('http://localhost:3000'));
