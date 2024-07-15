import express from 'express';
import cors from 'cors';
import axios from 'axios';
import connectDB from './db';
import PriceData from './models/PriceData';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


connectDB();

app.get('/api/prices/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await PriceData.find({ symbol }).sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


const symbols = ['BTC', 'ETH', 'GOOG', 'AAPL', 'TSLA'];
const fetchData = async () => {
  for (const symbol of symbols) {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
      const price = response.data[symbol.toLowerCase()].usd;
      const priceData = new PriceData({ symbol, price });
      await priceData.save();
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    }
  }
};

setInterval(fetchData, 5000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
