import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import uuid from 'uuid-random';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const privateKey = process.env.JAAS_PRIVATE_KEY.replace(/\\n/g, '\n');
const appId = process.env.JAAS_APP_ID;
const kid = process.env.JAAS_KID;
const PORT = process.env.PORT || 3000;

app.post('/generate-token', (req, res) => {
  const { name, email, avatar, isModerator } = req.body;

  if (!name || !email || typeof isModerator !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user fields' });
  }

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    sub: appId,
    room: '*',
    exp: now + 3 * 60 * 60,
    nbf: now - 10,
    context: {
      user: {
        id: uuid(),
        name,
        email,
        avatar,
        moderator: isModerator
      },
      features: {
        livestreaming: 'true',
        recording: 'true',
        transcription: 'true',
        'outbound-call': 'true'
      },
      room: {
        regex: false
      }
    }
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: {
      alg: 'RS256',
      typ: 'JWT',
      kid
    }
  });

  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`JWT generator server running on http://localhost:${PORT}`);
});