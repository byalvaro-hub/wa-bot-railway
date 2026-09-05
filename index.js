const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const crypto = require('crypto');  // ← INI PENTING!
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('⚡ BOT WA MONZ XTER WITH .MENU ⚡');
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.key.fromMe && msg.message?.conversation) {
      const text = msg.message.conversation.toLowerCase();
      const jid = msg.key.remoteJid;

      // ======== .MENU ======== //
      if (text === '.menu') {
        const menuText = `╔═══════════════════════════╗
║   🤖 MENU BOT MONZ XTER  ║
╠═══════════════════════════╣
║ 📥 DOWNLOADER             ║
║  .yt <link> - Download YT ║
║  .ig <link> - Download IG ║
║  .tt <link> - Download TT ║
║  .spotify <link> - Spotify║
╠═══════════════════════════╣
║ 🎮 GAME                   ║
║  .tebak - Game tebak kata ║
║  .susun - Susun kata      ║
║  .cak - Cak lontong       ║
║  .leaderboard - Skor      ║
╠═══════════════════════════╣
║ 👥 GRUP                   ║
║  .hidetag - Tag semua     ║
║  .kick @user - Kick       ║
║  .promote @user - Naikin  ║
║  .demote @user - Turunin  ║
║  .close - Tutup grup      ║
║  .open - Buka grup        ║
╠═══════════════════════════╣
║ ⚙️ LAINNYA                ║
║  .ping - Cek bot          ║
║  .status - Info bot       ║
║  .sticker - Jadi stiker   ║
╚═══════════════════════════╝
⚡ BY: MONZ XTER - 2090 ⚡`;
        
        await sock.sendMessage(jid, { text: menuText });
      }

      // ======== DOWNLOADER ======== //
      else if (text.startsWith('.yt ')) {
        const url = text.replace('.yt ', '');
        try {
          const info = await ytdl.getInfo(url);
          const title = info.videoDetails.title;
          await sock.sendMessage(jid, { text: `🎬 Downloading: ${title}` });
        } catch (e) {
          await sock.sendMessage(jid, { text: '❌ Link YT invalid!' });
        }
      }

      else if (text.startsWith('.ig ')) {
        const url = text.replace('.ig ', '');
        await sock.sendMessage(jid, { text: `📥 Download IG dari: ${url}` });
      }

      else if (text.startsWith('.tt ')) {
        const url = text.replace('.tt ', '');
        await sock.sendMessage(jid, { text: `📥 Download TikTok dari: ${url}` });
      }

      // ======== GAME ======== //
      else if (text === '.tebak') {
        await sock.sendMessage(jid, { text: '🎮 Tebak kata: "Aku punya sisik, aku hidup di air" - Jawab: I_K_N' });
      }

      else if (text === '.leaderboard') {
        await sock.sendMessage(jid, { text: '🏆 LEADERBOARD:\n1. Monz - 1000 poin\n2. Xter - 800 poin\n3. User - 500 poin' });
      }

      // ======== GRUP ======== //
      else if (text === '.hidetag') {
        try {
          const groupMetadata = await sock.groupMetadata(jid);
          const participants = groupMetadata.participants.map(p => p.id);
          await sock.sendMessage(jid, { text: '🔔 @all', mentions: participants });
        } catch (e) {
          await sock.sendMessage(jid, { text: '❌ Gagal hidetag! Bot bukan admin?' });
        }
      }

      else if (text === '.close') {
        try {
          await sock.groupSettingUpdate(jid, 'announcement');
          await sock.sendMessage(jid, { text: '🔒 Grup ditutup!' });
        } catch (e) {
          await sock.sendMessage(jid, { text: '❌ Gagal tutup grup!' });
        }
      }

      else if (text === '.open') {
        try {
          await sock.groupSettingUpdate(jid, 'not_announcement');
          await sock.sendMessage(jid, { text: '🔓 Grup dibuka!' });
        } catch (e) {
          await sock.sendMessage(jid, { text: '❌ Gagal buka grup!' });
        }
      }

      // ======== LAINNYA ======== //
      else if (text === '.ping') {
        await sock.sendMessage(jid, { text: '🏓 Pong! Bot sehat!' });
      }

      else if (text === '.status') {
        await sock.sendMessage(jid, { text: '✅ Bot aktif 24/7 di Railway! 🚀' });
      }

      else if (text === '.sticker') {
        await sock.sendMessage(jid, { text: '📸 Kirim gambar/video dengan caption .sticker' });
      }
    }
  });

  app.listen(PORT, () => console.log(`✅ Web running di port ${PORT}`));
}

startBot();
