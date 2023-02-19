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
});
const openai = new OpenAIApi(configuration);

// Meme Function
const sendMeme = async (chat) => {
  try {
    const response = await axios.get("https://meme-api.com/gimme");
    const memeUrl = response.data.url;
    const memeCaption = response.data.title;

    const caption = memeCaption || "";
    const media = await MessageMedia.fromUrl(memeUrl);
    await chat.sendMessage(media, { caption });
  } catch (error) {
    console.error(error);
  }
};

// Load the session data
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
    authStrategy: new RemoteAuth({
     