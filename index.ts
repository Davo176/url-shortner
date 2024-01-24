import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const urlDatabase: { [key: string]: string } = {};

app.post('/shorten', (req, res) => {
  console.log(req.body)
    const originalUrl: string = req.body.url;
    const shortCode: string = req.body.shortcode;
  
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    if (!shortCode) {
      return res.status(400).json({ error: 'Short URL is required' });
    }
    
    urlDatabase[shortCode] = originalUrl;
  
    res.json({ originalUrl, shortCode });
  });
  
  app.get('/s/:shortCode', (req, res) => {
    const shortCode: string = req.params.shortCode;
    const originalUrl: string | undefined = urlDatabase[shortCode];
  
    if (originalUrl) {
      res.redirect(originalUrl);
    } else {
      res.status(404).send('Not Found');
    }
  });

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});