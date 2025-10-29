const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot設定（環境変数を使用）
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// LINEクライアント
const client = new line.Client(config);

// ミドルウェア
app.use(cors());
// 注意: 署名検証のため、/webhook 専用のJSONパーサで生ボディを保持します
app.use(express.urlencoded({ extended: true }));

// Dify API 連携
async function sendToDify(message, userId) {
  try {
    const response = await axios.post(
      process.env.DIFY_API_URL, // 例: https://api.dify.ai/v1/chat-messages
      {
        inputs: {},
        query: message,
        response_mode: 'blocking',
        user: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.answer || '申し訳ございませんが、応答を生成できませんでした。';
  } catch (error) {
    console.error('Dify API エラー:', error.response?.data || error.message);
    return 'エラーが発生しました。しばらく時間をおいてから再度お試しください。';
  }
}

// /webhook 専用のJSONパーサ（署名検証用に生ボディを保持）
const lineJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // LINE SDKが署名検証で参照
  },
});

// Webhookハンドラ
app.post('/webhook', lineJsonParser, line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook エラー:', err);
      res.status(500).end();
    });
});

// イベント処理
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  const userId = event.source.userId;
  const messageText = event.message.text;

  try {
    const difyResponse = await sendToDify(messageText, userId);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: difyResponse,
    });
  } catch (error) {
    console.error('メッセージ処理エラー:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '申し訳ございませんが、エラーが発生しました。しばらく時間をおいてから再度お試しください。',
    });
  }
}

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルート
app.get('/', (req, res) => {
  res.json({
    message: 'Dify + LINE Bot連携ツールが動作中です',
    version: '1.0.0',
    endpoints: { webhook: '/webhook', health: '/health' },
  });
});

// 起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
});
