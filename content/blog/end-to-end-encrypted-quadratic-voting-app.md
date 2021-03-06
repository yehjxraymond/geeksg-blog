---
template: blog-post
title: Implementing End-to-End Encryption on a Quadratic Voting (QV) Application
publishedDate: 2019-12-20T12:00:28.345Z
description: Recently, my tribe held our promotion nomination exercise using my quadratic voting app. The exercise allow all members of the tribe to vote one another for the upcoming promotion. One of the concerns of using the quadratic voting application was that I could potentially read and change the votes since I've database access. How would I convince my colleagues to trust me?
featured: false
img: ../../static/images/lock-on-chain.png
imgAlt: Don't Ask, Don't Tell
tags:
  - encryption
  - quadratic-voting
---

Recently, my tribe held our promotion nomination exercise using my [quadratic voting app](https://qv.geek.sg/). The exercise allow all members of the tribe to vote one another for the upcoming promotion. One of the concerns of using the quadratic voting application was that I could potentially read and change the votes since I've database access.

As a result, I've decided to lock myself out of my own AWS account by allowing another colleague to set the password to my account while I maintain access to my MFA during the election period. At the end of the election period, we will log into the account and remove all the entries in the database. This allows no one to read or write the database while the election is ongoing. If I've attempted to reset my account password, my colleague would discover my attempt to peek or cheat when he is unable to log into the account when the election ends.

In theory, it was a great idea... But looking back, wouldn't it be better if the election results can be trusted even if I've access to the database directly? That's where I went back to the application and implemented E2E encryption on the election where it can be verified that:

1. The database owner is not privy to the individual votes
2. The election creator and voters can check that a specific vote has been accounted for

## Asymmetric Encryption to the Rescue

To achieve that, an asymmetric key pair would be used. The public key will be saved onto the database and used by voters to encrypt their votes on the client side. The voters will only transmit the encrypted vote to the database to be stored. The election creator, with his private key stored offline, would be able to decrypt individual votes on the client side.

Looking around, I found a suitable npm package for this purpose. [eccrypto](https://www.npmjs.com/package/eccrypto) provides a simple api to use ECIES encryption scheme for asymmetric encryption. I've decided to dumb the api down even further by wrapping the api to allow keys to be passes around in strings rather than buffers:

```js
const eccrypto = require("eccrypto");

const toBuffer = (txt) => Buffer.from(txt, "hex");
const toString = (buf) => buf.toString("hex");

const randomPrivateKey = () => {
  const key = eccrypto.generatePrivate();
  return toString(key);
};

const publicKeyFromPrivateKey = (privateKeyStr) => {
  const privateKey = toBuffer(privateKeyStr);
  return toString(eccrypto.getPublic(privateKey));
};

const encryptStringWithPublicKey = async (cleartext, publicKeyStr) => {
  const publicKey = toBuffer(publicKeyStr);
  const res = await eccrypto.encrypt(publicKey, Buffer.from(cleartext));
  const { iv, ciphertext, mac, ephemPublicKey } = res;
  return {
    iv: toString(iv),
    ciphertext: toString(ciphertext),
    mac: toString(mac),
    ephemPublicKey: toString(ephemPublicKey),
  };
};

const decryptStringWithPrivateKey = async (cipher, privateKeyStr) => {
  const privateKey = toBuffer(privateKeyStr);
  const { iv, ciphertext, mac, ephemPublicKey } = cipher;
  const encrypted = {
    iv: toBuffer(iv),
    ephemPublicKey: toBuffer(ephemPublicKey),
    ciphertext: toBuffer(ciphertext),
    mac: toBuffer(mac),
  };
  const cleartext = await eccrypto.decrypt(privateKey, encrypted);
  return cleartext.toString();
};
```

[source code](https://github.com/yehjxraymond/qv-api/blob/master/src/encryption/index.js)

With the dumbed-down api for cryptography, I allowed the web app to generate it's own private key on the client side when the "E2E Encrypted Votes" options is checked.

![Creating Private Election (w E2E encryption)](../../static/images/qv-create-election.png)

On election creation, the payload to the endpoint looks like:

```json
{
  "candidates": [
    { "title": "Candidate 1", "description": null },
    { "title": "Candidate 2", "description": null }
  ],
  "id": "52512c56-3e5f-44cf-916d-3053b8864c3f",
  "ttl": 1577372246,
  "config": {
    "name": "Demo Election",
    "private": true,
    "notifyInvites": false,
    "invite": [
      {
        "name": "Person 1",
        "voterId": "452c559d-219c-4fde-8be5-b03dc863622e",
        "email": "person1@example.com"
      },
      {
        "name": "Person 2",
        "voterId": "32840834-fd23-4a38-9f48-12eba1c9786b",
        "email": "person2@example.com"
      }
    ],
    "encryptionKey": "04d97a57c595835fa00d608345947bbbf9c42899df693a78535d9eb24d301574e0babfed36fea560cf56ca14fc89329d0660aa6976f10c8c10af3b7b7f67a3ef4b",
    "budget": 99
  },
  "votes": []
}
```

Upon creating the election, the election creator will be redirected to a url where he is able to access the results of the private election with the following link:

```txt
https://qv.geek.sg/share-private?
  election=52512c56-3e5f-44cf-916d-3053b8864c3f&
  userId=f9367230-6141-46e1-89a6-3d09ea951466&
  privateKey=3fe8dd4abe91f7312696ffdb1f06c818cc76464f24b561ccd08ad099e135ecaf
```

In the url:

- `election` is used to uniquely identity the election to view
- `userId` is used to "authenticate" the user to download the election results
- `privateKey` is used to decrypt the downloaded results

![Private Voting Links](../../static/images/qv-private-voting-links.png)

On this page, the election creator will have access to the various private voting link as well as the link to view the results. Each of these links can be used once to cast a vote on the election.

![Private Voting Page](../../static/images/qv-voting-page.png)

Visiting one of these link, the voter can then cast his vote. When submitting the vote, the web app encrypts the vote on the client side and only send the encrypted vote to the endpoint.

Below are two sample requests of votes being casted:

```json
{
  "voter": "452c559d-219c-4fde-8be5-b03dc863622e",
  "election": "52512c56-3e5f-44cf-916d-3053b8864c3f",
  "encryptedVote": {
    "iv": "2f7a2f053fe900eb44d2b4c14f40e074",
    "ciphertext": "a8dc4a9f834bb1aeadc8f5d7fd4795b063cae8b9b3c92d8c8c21525b7da7104c0c27d3819e3176638840f490347c7ed1d29eb8a1a5608f758dd712419070b310",
    "mac": "b8303e08cbf2128d7e72f1fa993b9f9e1d1c5047e1e99d768f589d3bcb515a05",
    "ephemPublicKey": "04366010729df6b803f94c8aa1df18c245a2de3018a142339b587db953f4f283ac8e610ccc374cce7845fa585a068d77b0166a9da75cedf78975a96100e91b003d"
  }
}
```

```json
{
  "voter": "32840834-fd23-4a38-9f48-12eba1c9786b",
  "election": "52512c56-3e5f-44cf-916d-3053b8864c3f",
  "encryptedVote": {
    "iv": "87572848a64ae46cbf4ff5881a81e2fd",
    "ciphertext": "af26e53536b19b1497860a4a61657854d2b5e267c48df49b853339ac491a6101a3ea605f0006292ac002d2de7880febc76cb75612537890a1ced1e7ba93130b1",
    "mac": "42190e7e33e9d198d58c3114e84e07c4ee562989dbad5b3114b193a90553355c",
    "ephemPublicKey": "042e11a0fccbfffdf96e8d5e0b44093f204934c5edf0b6700e67eedeb2de8a41d5d24a3cc41474d9852dbd935cdc56dda7ac1e4e0f57cf292621f326806df5dc92"
  }
}
```

Once votes have been casted, the election creator may view the election results with his link.

![Decrypted Vote Results](../../static/images/qv-sample-vote-results.png)

Snippet of endpoint response to election creator's web app:

```json
{
  ...,
  "votes": [
    {
      "voter": "32840834-fd23-4a38-9f48-12eba1c9786b",
      "encryptedVote": {
        "ciphertext": "af26e53536b19b1497860a4a61657854d2b5e267c48df49b853339ac491a6101a3ea605f0006292ac002d2de7880febc76cb75612537890a1ced1e7ba93130b1",
        "iv": "87572848a64ae46cbf4ff5881a81e2fd",
        "mac": "42190e7e33e9d198d58c3114e84e07c4ee562989dbad5b3114b193a90553355c",
        "ephemPublicKey": "042e11a0fccbfffdf96e8d5e0b44093f204934c5edf0b6700e67eedeb2de8a41d5d24a3cc41474d9852dbd935cdc56dda7ac1e4e0f57cf292621f326806df5dc92"
      },
      "ttl": 1577372246,
      "id": "9145b753-baac-4a6f-a173-46427b1c1366",
      "election": "52512c56-3e5f-44cf-916d-3053b8864c3f"
    },
    {
      "voter": "452c559d-219c-4fde-8be5-b03dc863622e",
      "encryptedVote": {
        "ciphertext": "a8dc4a9f834bb1aeadc8f5d7fd4795b063cae8b9b3c92d8c8c21525b7da7104c0c27d3819e3176638840f490347c7ed1d29eb8a1a5608f758dd712419070b310",
        "iv": "2f7a2f053fe900eb44d2b4c14f40e074",
        "mac": "b8303e08cbf2128d7e72f1fa993b9f9e1d1c5047e1e99d768f589d3bcb515a05",
        "ephemPublicKey": "04366010729df6b803f94c8aa1df18c245a2de3018a142339b587db953f4f283ac8e610ccc374cce7845fa585a068d77b0166a9da75cedf78975a96100e91b003d"
      },
      "ttl": 1577372246,
      "id": "c8717d90-7eb8-43db-b911-4ea3e2cc8cb0",
      "election": "52512c56-3e5f-44cf-916d-3053b8864c3f"
    }
  ]
}
```

## Vote Integrity

Now that we have solved the problem of database administrator having access to the information, we have yet to ensure that valid votes are not deleted or replaced.

For that, we are able to verify the integrity of the vote by allowing voters to keep the `iv` of their votes as a receipt. They can check with the election creator that their votes have been accounted for.

## Ending Notes

Now that E2E encryption has been enabled on the QV app, can we use this app to run the next Singapore General Election?

Nope.

If you are searching for more kickass implementations of QV, check out [this paper on "End-to-End Verifiable Quadratic Votingwith Everlasting Privacy"](https://fc19.ifca.ai/voting/papers/PR19.pdf)

Most of the design around the application trades off security for usability to allow anyone to create a QV election. While its not fit for a general election, it is definitely sufficient for most application. If you have any cool ideas to use QV for, feel free to [drop me a note](/contact)!

Again, the QV application code is open source, if you like to contribute to the code or run a fork, feel free to visit:

- https://github.com/yehjxraymond/qv-api
- https://github.com/yehjxraymond/qv-app
