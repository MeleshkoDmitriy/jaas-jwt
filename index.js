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
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCRrDHTl6FyMAdW
kqr8347HhEPFKvMIDVE3aSeBggAiZk5rWOwRFGZ6iBG+5uDbhrgdz4YSsGUDPjWs
YTqUMA6KUA9RFYI3MsiC1hRlDEVOl8wcvNWBFazJ9PS1MpzNqcNwF+4fqUQIbEPo
I3G4EwCqKlqhSPt4ukuAQq3fckdVO90SrEkXbk8m6gnOhrh46aYrSns8NDXN4oTh
QVqTZWzLtMNyAM//7OEOAgfj70LuEcKiff6+QI5+1mLVjrMGzvrIFNdkanPreQF0
anJjWpL2/bxVjMI4k8jxUzCz7HQIHZ6AzX0tFG9XdmKDW4uS2+9lcHbfo3G2hQEb
8wLX68i9AgMBAAECggEBAI1ReX0Fyq+V/Gh2HL74ufDAVWZ/hgm3saSJtLOkxDCb
A1SMjWb8XXZdbqm+HUGabh8tZanXygbdYQB7ynJcNJ7lkBZfQVX/RBn5SQvGXa4j
APaYEqAJwPijVIo8MXYrTNf/vxikAsYREcewKvAiLzDlqcpxnNPAFuK0zSzKFn2N
+m7Bur0pUdtOQDgHZGH7Tx2w+ww2/laUhD1v3J6qZbLoufcihhIGYMoziMBqbKV0
N9ksm4TOvXs/Qx6nVeo8EZjW9Yu4nC15tzgwFHts6O3wxOus7i/dZ+ZkMZ+wqr2r
OxzU9QzXbDLQQw0RBr30YEGM0g5U+xyf2M4ANj6Og5kCgYEA6LcVviPZlj1Pldr8
POOgF+CQQ2nwpE2GTfwOIKGaBkzpjH3ATinnJ4UIa65WR2J/uWkOMM2y9EYluKrO
9sBBed45MpX7XmyfpkCS3bf6GgfSg4JlqT3EDxs7FYyj6GZdydn9pYSVadhfb588
zIZXxOOntlBK7c4zyftO8c/RkT8CgYEAoD+L6BsthIpqTixRHm1q7GeKgB4E7+rs
ZuJI0xSD8ZlqZ6K6fZ0uiNoLVts0cYP7H63JPUi/6LLu47kLoCXZY3vbw1U78Gsv
DfcycPCYfxNJx69dh27PVx9J1Xp+sVfYnW5mTphhSQVPDidOis3yfh9jF2hx8v5Y
v05Yn8UOqwMCgYEAi4H2Tt4++ooWw8dbn0T2HFpLIZ7I3DZ9ZRLNhVJbe5twBwD7
39/O6yodOjBxGKo713LbRvaJaVcEFgiPuezXU6+cqm6vGpQTwR7E7JX2INS/pobt
Wt/kQQoaCXkeaZu0beV44VjyGVnVHJ1hXVrMEwRG7kyEHruW4Gb/lIb5IxECgYEA
g/6T4SWxwoC4u5dpYeTCs+M9g/Y2HuCkxMITNjqpy/GQYbj6X8l+sR7ZRDve4LnT
ue5N2nr4CFaKy2x6lPlYLMey5xxn+MpwwdIh7EFhexqKJT7fjVTK2HpfOMZjYPR4
6oQrJQYC7EDBM2lRGqg024pC9t8DLSIwO7Pu7/tC770CgYBGLs2NsWNcvtUYIvj/
D5Hg+BZrk/phY2ZRO29oWsMseaG/qZq3IeBPlxZ33Sio4Qzd4LG1vtzglbkk8r1p
kA+teCpfU2mih27MWS31UOmMl7ZAxD1Zyil+HMYnt6SHBAx3Y/bOZZ6RcdyMm0Vm
gd8PvXwC/2sq86Y0b56SQTsRhw==
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