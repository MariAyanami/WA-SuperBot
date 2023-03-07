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
      store: store,
      backupSyncIntervalMs: 1000000,
    }),
  });

  // QR Code
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });
  client.on("remote_session_saved", () => {
    console.log("Remote session saved");
  });

  client.on("message", async (message) => {
    let chat = await message.getChat();

    // Group Chat
    if (chat.isGroup) {
      let grpid = chat.id._serialized;
      console.log("Group ID: " + grpid);

      if (message.body === "-sticker") {
        if (message.hasMedia) {
          message.downloadMedia().then((media) => {
            if (media) {
              const mediaPath = "./downloaded-media/";

              if (!fs.existsSync(mediaPath)) {
                fs.mkdirSync(mediaPath);
              }

              const extension = mime.extension(media.mimetype);

              const filename = new Date().getTime();

              const fullFilename = mediaPath + filename + "." + extension;

              // Save to file
              try {
                fs.writeFileSync(fullFilename, media.data, {
                  encoding: "base64",
                });
                console.log("File downloaded successfully!", fullFilename);
                console.log(fullFilename);
                MessageMedia.fromFilePath((filePath = fullFilename));

                client.sendMessage(
                  message.from,
                  new MessageMedia(media.mimetype, media.data, filename),
                  {
                    sendMediaAsSticker: true,
                  }
                );
                fs.unlinkSync(fullFilename);
                console.log(`File Deleted successfully!`);
              } catch (err) {
                console.log("Failed to save the file:", err);
                console.log(`File Deleted successfully!`);
              }
            }
          });
        } else {
          message.reply(`send image with caption *-sticker* `);
        }
      } else if (message.body === "-quote") {
        const apiData = await axios.get("https://type.fit/api/quotes");
        const randomNumber = Math.floor(Math.random() * apiData.data.length);
        message.reply(`*${apiData.data[randomNumber].text}*`);
      } else if (message.body === "-ping") {
        return message.reply("pong");
      } else if (message.body === "-meme") {
        try {
          const chat = await client.getChatById(message.from);
          await sendMeme(chat);
        } cat