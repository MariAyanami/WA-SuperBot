const { Client, RemoteAuth, MessageMedia } = require("whatsapp-web.js");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const qrcode = require("qrcode-terminal");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");
// Require database
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
dotenv.config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
})