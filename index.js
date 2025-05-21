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

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAogX7pE4nymM8
iNgtA1/NvpsBSJcWqmqoPf7iHsZ6NVtDU3m0hoXc+HgcAQQMVcoAt73wgoEXxWaV
YwP8OnNaFCty6X+qUYHiJq/f7l5H69qL5wOxVvcFaE/HisZjLkTUvqS7PAM54eTW
Esgi7O+ysB2za9Os4J8+eRqh1T4Kr4npHFjMTsHamz1gKO1e0BsWVgt0U/wioLuy
Xnu3ZqMVXdwEQMfm9dwKY4ybcYfWlYliOQtHoFJq+B9WfDm/cbtIzvknb15TY6XW
x3fMXTu1CUD48gV+aFBs/67/FSeKa6NgwLzqz1L9Sd8mQXoL5hLmC+6hKk/D53sC
eyBx609LAgMBAAECggEAEFtxwJ2CGXThGlnQaXoY34Ko7OH6Gm2cIu8ovpC4b9Yq
CryC4CZwJYRfxpj7fASo44i2sz6RsbAMdvDyfK+F7gc6bUaQlajYK5j3ZD98eAT6
CNk0AhINZcMmyx3onLFoHNyXZmLBL2AUK21q2zRdYkH8M6kbT1m/i/GCpm1SGFwL
vUWkPTwI/uODDei8+29arTtbv8mTQjAGkkZVG+3cqDQLzin3fuxQJXgbg9LFbdRj
tDk8AJlrNWbtP0Faf/sZPGxvq2jrvZvaLT2gATOkQ/frp8dOGLJBRF77Lan0+UV3
jde0EcKufDwPlke34QE7A8XTbDGqhV26mBB0nDyK8QKBgQDumCPkNWES5XtX4c49
7wkuu664BDcgbcUFR1DtcDg2BIG0qKCp3tg2+rCpojIhxm1SAjYU44D/oqaMlt2V
y5zTp8WOojMcIMP3bndbq+Fzd+0B3An5kZPE68t3xQnWqcnAy3hVITo7rkoVmOqg
5Re7lnP0nhJwXPysEGwMXEZB2QKBgQDOr4hfHMfzjLkhjXPOqfQvE2UtHJrDViCi
ZMFQKeEpfHjKGkRzjdoQn6BwzOOFgC4Is3Yvw1Oi4T7SFalS+VMIINhIKghclBME
hMBMBdGZnF8avUVAgU7RxENe/RXpux7hR+VeGxAiceOwPEUhV1U3qVm6KSH1zax6
T87rwVD/wwKBgF4MOHGXHOme7WypxGsjUwJJ1sgQWU5+FmBLSToetvmL8zisE5CC
F8YsMQDcv1gS6DqgRoMbXljl2zKlsTh/pxTDGBtuEilvPO/GamQHL3oddp36BzCJ
0q6Xp39RetxT1wQY8BjWXSbzP56dxTagtycpWhG9UVVbQfntCzogEU2ZAoGAPRwX
NQ/8ap0z66C4GeWUJgsVAhaQB6tCcOFbaslHIo4D5LWJgaTyUbHwrQlXSBSTB82P
5yVYaDMy8MiozLic/S1A5W1QFZdOXCqn9JJP25wpXm2RuTXCSTE/PimUPgwuYCty
vLVBuv1zdZsMUYRR1OhEeE9LFDMgiPVp17jLqyMCgYEApuFutAOiNc51mQ6Cffu1
/NscoEzIala3Q32ApbLmO0z2GwOaesDh0uJtz8+EBaLeezwmdnJGCnb9/elNIYew
c65Cyp2LJZY4zmcI3OoUaMNXRqV/NJAMT1q2E9ON+mVH9Y97fuv48XdEntLKR33C
VvEpAJxfgm2IPG/jeuxxW78=
-----END PRIVATE KEY-----`;
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