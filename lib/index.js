import express from "express";
import config from "config";
import cherio from 'cherio';
import chalk from 'chalk';
import instagramParce from './instagramParce'

const SITE = 'https://www.instagram.com/';

const app = express()
const PORT = config.get("port")
const DEFAULT_LIMIT = config.get("defailt-limit")

app.get("/", async (req, res) => {
  
  if (!req.query.user) return res.status(400).json({ message: "Bad Request" });
  const user = req.query.user;
  const limit = req.query.limit || DEFAULT_LIMIT;
  const description = !!req.query.desc || req.query.desc === '';
  const comments = !!req.query.comments || req.query.comments === '';

  const result = await instagramParce({user, limit, description, comments});

  res.send(result)
})

function start () {
  try {
    app.listen(PORT, () => {
      console.log(chalk.green(`Example app listening at http://localhost:${PORT}`))
    })
  } catch (e) {
    console.log(chalk.red(e.message))
  }
}

start()