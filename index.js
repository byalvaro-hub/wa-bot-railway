// ============================================
// BOT WHATSAPP MONZ XTER - VERSION 2.0
// ALL FEATURES + FIX ERROR + AUTO RECONNECT
// ============================================

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const crypto = require('crypto');
const qrcode = require('qrcode-terminal');
const app = express();
const PORT = process.env.PORT || 3000;

// ======== WEB SERVER ======== //
app.get('/', (req, res) => {
  res.send('⚡ BOT WA MONZ XTER WITH .MENU ⚡');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ======== FUNCTION START BOT ======== //
async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['Monz Bot', 'Chrome', '120.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true
    });

    // ======== HANDLE QR CODE ======== //
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('📱 SCAN QR CODE INI:');
        qrcode.generate(qr, { small: true });
        console.log('\n📱 ATAU SCAN DARI TERMINAL DI ATAS!');
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('🔄 Reconnecting...');
          startBot();
        } else {
          console.log('❌ Session expired, scan ulang!');
        }
      }

      if (connection === 'open') {
        console.log('✅ BOT BERHASIL NYALA!');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // ======== HANDLE PESAN ======== //
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && msg.message?.conversation) {
        const text = msg.message.conversation.toLowerCase().trim();
        const jid = msg.key.remoteJid;
        const sender = msg.pushName || 'User';

        console.log(`📩 Pesan dari ${sender}: ${text}`);

        // ===== .MENU ===== //
        if (text === '.menu') {
          const menuText = `╔═══════════════════════════════╗
║   🤖 MENU BOT MONZ XTER  ║
╠═══════════════════════════════╣
║ 📥 DOWNLOADER                 ║
║  .yt <link> - Download YT     ║
║  .ig <link> - Download IG     ║
║  .tt <link> - Download TikTok ║
║  .spotify <link> - Spotify    ║
╠═══════════════════════════════╣
║ 🎮 GAME                       ║
║  .tebak - Game tebak kata     ║
║  .susun - Susun kata          ║
║  .cak - Cak lontong           ║
║  .leaderboard - Skor          ║
╠═══════════════════════════════╣
║ 👥 GRUP                       ║
║  .hidetag - Tag semua         ║
║  .kick @user - Kick           ║
║  .promote @user - Naikin      ║
║  .demote @user - Turunin      ║
║  .close - Tutup grup          ║
║  .open - Buka grup            ║
╠═══════════════════════════════╣
║ ⚙️ LAINNYA                    ║
║  .ping - Cek bot              ║
║  .status - Info bot           ║
║  .sticker - Jadi stiker       ║
║  .owner - Info owner          ║
║  .help - Bantuan              ║
╚═══════════════════════════════╝
⚡ BY: MONZ XTER - 2090 ⚡
🔥 GASS MONZ XTER! 🔥`;

          await sock.sendMessage(jid, { text: menuText });
        }

        // ===== PING ===== //
        else if (text === '.ping') {
          await sock.sendMessage(jid, { text: '🏓 Pong! Bot sehat dan stabil!' });
        }

        // ===== STATUS ===== //
        else if (text === '.status') {
          const statusText = `✅ STATUS BOT:
📡 Bot: ONLINE
⏱️ Uptime: 24/7
🚀 Platform: Railway
👤 Owner: Monz Xter
📅 Tahun: 2090
🔒 Mode: Unrestricted
⚡ GASS MONZ XTER!`;

          await sock.sendMessage(jid, { text: statusText });
        }

        // ===== OWNER ===== //
        else if (text === '.owner') {
          await sock.sendMessage(jid, { text: '👤 Owner: Monz Xter\n📱 Contact: Hubungi via WhatsApp\n⚡ Bot ini dibuat untuk melawan AI sensor!' });
        }

        // ===== HELP ===== //
        else if (text === '.help') {
          await sock.sendMessage(jid, { text: '🤖 Ketik .menu untuk lihat semua perintah!\n📌 Atau tanyakan langsung ke owner.' });
        }

        // ===== STICKER ===== //
        else if (text === '.sticker') {
          await sock.sendMessage(jid, { text: '📸 Kirim gambar/video dengan caption .sticker\n⚠️ Fitur ini butuh media, bukan teks!' });
        }

        // ===== GROUP COMMANDS ===== //
        else if (text === '.hidetag') {
          try {
            const groupMetadata = await sock.groupMetadata(jid);
            const participants = groupMetadata.participants.map(p => p.id);
            await sock.sendMessage(jid, { text: '🔔 @all', mentions: participants });
          } catch (e) {
            await sock.sendMessage(jid, { text: '❌ Gagal hidetag! Pastikan bot admin dan ini grup.' });
          }
        }

        else if (text === '.close') {
          try {
            await sock.groupSettingUpdate(jid, 'announcement');
            await sock.sendMessage(jid, { text: '🔒 Grup ditutup! Hanya admin yang bisa chat.' });
          } catch (e) {
            await sock.sendMessage(jid, { text: '❌ Gagal tutup grup! Bot harus admin.' });
          }
        }

        else if (text === '.open') {
          try {
            await sock.groupSettingUpdate(jid, 'not_announcement');
            await sock.sendMessage(jid, { text: '🔓 Grup dibuka! Semua anggota bisa chat.' });
          } catch (e) {
            await sock.sendMessage(jid, { text: '❌ Gagal buka grup! Bot harus admin.' });
          }
        }

        // ===== GAMES ===== //
        else if (text === '.tebak') {
          const games = [
            '🎮 Tebak kata: "Aku punya sisik, aku hidup di air" - Jawab: I_K_N (huruf hilang)',
            '🎮 Tebak kata: "Aku terbang tanpa sayap" - Jawab: A_A_ (huruf hilang)',
            '🎮 Tebak kata: "Aku punya mata tapi gak bisa lihat" - Jawab: J_R_M (huruf hilang)'
          ];
          const randomGame = games[Math.floor(Math.random() * games.length)];
          await sock.sendMessage(jid, { text: randomGame });
        }

        else if (text === '.leaderboard') {
          await sock.sendMessage(jid, { text: '🏆 LEADERBOARD:\n1. Monz - 1000 poin\n2. Xter - 800 poin\n3. User - 500 poin\n4. Bot - 300 poin\n5. Admin - 100 poin' });
        }

        // ===== DOWNLOADERS (SIMPLE) ===== //
        else if (text.startsWith('.yt ')) {
          const url = text.replace('.yt ', '');
          try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            await sock.sendMessage(jid, { text: `🎬 Downloading: ${title}\n⏳ Proses... (kirim file audio nanti)` });
          } catch (e) {
            await sock.sendMessage(jid, { text: '❌ Link YouTube invalid! Coba yang lain.' });
          }
        }

        else if (text.startsWith('.ig ')) {
          const url = text.replace('.ig ', '');
          await sock.sendMessage(jid, { text: `📥 Download Instagram dari: ${url}\n⚠️ Fitur ini butuh API key. Contact owner.` });
        }

        else if (text.startsWith('.tt ')) {
          const url = text.replace('.tt ', '');
          await sock.sendMessage(jid, { text: `📥 Download TikTok dari: ${url}\n⚠️ Fitur ini butuh API key. Contact owner.` });
        }

        else if (text.startsWith('.spotify ')) {
          const url = text.replace('.spotify ', '');
          await sock.sendMessage(jid, { text: `🎵 Download Spotify dari: ${url}\n⚠️ Fitur ini butuh API key. Contact owner.` });
        }

        // ===== HI/HELLO ===== //
        else if (['halo', 'hi', 'hai', 'hello', 'bot'].includes(text)) {
          const replies = [
            `Halo juga ${sender}! Ada yang bisa gua bantuin? Ketik .menu buat liat fitur! 😈`,
            `Yo ${sender}! Bot Monz Xter siap membantu! .menu buat lihat fitur! 🔥`,
            `Gass ${sender}! Ada yang perlu? .menu buat liat semua perintah! ⚡`
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          await sock.sendMessage(jid, { text: randomReply });
        }

        // ===== DEFAULT REPLY ===== //
        else if (text.startsWith('.')) {
          await sock.sendMessage(jid, { text: `❌ Perintah "${text}" tidak dikenal! Ketik .menu untuk lihat daftar perintah.` });
        }
      }
    });

    // ======== START WEB SERVER ======== //
    app.listen(PORT, () => {
      console.log(`✅ Web server running di port ${PORT}`);
      console.log(`🌐 Akses: https://wa-bot-railway.railway.app`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('🔄 Restarting bot dalam 5 detik...');
    setTimeout(startBot, 5000);
  }
}

// ======== START BOT ======== //
console.log('🚀 STARTING BOT MONZ XTER...');
console.log('📱 Menunggu QR Code...');
startBot();
