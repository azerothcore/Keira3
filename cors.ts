// https://github.com/Miorey/bypass-cors-policies
const express = require(`express`);
const morgan = require(`morgan`);
const fsPromises = require(`fs`).promises;
const fs = require(`fs`);
const path = require(`path`);
const cors = require(`cors`);

export const appRest = express();
const TIMEOUT = 2000;
const SERVER_NAME = 'https://wow.zamimg.com';

const fetch = require(`node-fetch`);

appRest.use(morgan(`dev`));

appRest.use(express.json());
appRest.use(express.urlencoded({ extended: true }));

const storageDir = path.join(__dirname, 'storage-3d-cache');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir);
}

appRest.use(cors());

async function createFile(req) {
  console.log(`${SERVER_NAME}${req.url}`);
  const localFilePath = path.join(storageDir, encodeURIComponent(req.url));
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${TIMEOUT} milli-seconds`));
    }, TIMEOUT);
  });

  const response: any = await Promise.race([fetch(`${SERVER_NAME}${req.url}`), timeout]).catch(() => ({ ok: false, status: 408 }));
  if (!response.ok) {
    return response.status;
  }
  const buffer = await response.arrayBuffer();
  await fsPromises.writeFile(localFilePath, Buffer.from(buffer));
  return false;
}

appRest.use(`/`, async (req, res, next) => {
  const localFilePath = path.join(storageDir, encodeURIComponent(req.url));
  if (!fs.existsSync(localFilePath)) {
    const err = await createFile(req);
    if (err) {
      console.warn(`Error ${err} on ${SERVER_NAME}${req.url}`);
      res.status(err);
      return next(err);
    }
  }
  res.sendFile(localFilePath);
});
