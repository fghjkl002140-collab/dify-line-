cexpress = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// LINE Botクライアント
const client = new line.Client(config);

// ミドルウェア設定
app.use(cors());
// NOTE: LINEの署名検証ではリクエストの生バイト列が必要になるため、
// グローバルな express.json() は使わず、/webhook のみ専用のパーサを適用する
app.use(express.urlencoded({ extended: true }));

// Dify APIとの連携関数
async function sendToDify(message, userId) {
  try {
    // エージェントチャットアプリの場合は streaming モードを使用
    const response = await axios.post(process.env.DIFY_API_URL, {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      user: userId,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream', // SSE形式のレスポンスを要求
      },
      responseType: 'stream', // ストリーミングレスポンスを受け取る
      timeout: 60000, // 60秒のタイムアウト
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    // ストリーミングレスポンスを処理
    let fullAnswer = '';
    let eventData = '';
    let isDone = false;
    
    return new Promise((resolve) => {
      const tryResolve = () => {
        if (!isDone) {
          isDone = true;
          resolve(fullAnswer || '申し訳ございませんが、応答を生成できませんでした。');
        }
      };

      response.data.on('data', (chunk) => {
        eventData += chunk.toString();
        
        // Server-Sent Events (SSE) 形式のデータを処理
        const lines = eventData.split('\n');
        eventData = lines.pop(); // 不完全な行を保持
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            
            // [DONE] イベントで終了
            if (payload === '[DONE]') {
              tryResolve();
              return;
            }
            
            try {
              const data = JSON.parse(payload);
              if (data.answer) {
                fullAnswer = data.answer;
              }
              // event: message_end で終了
              if (data.event === 'message_end') {
                tryResolve();
                return;
              }
            } catch (e) {
              // JSON解析エラーは無視
            }
          }
        }
      });

      response.data.on('end', () => {
        // 最後の不完全な行も処理
        if (eventData.startsWith('data: ')) {
          const payload = eventData.slice(6).trim();
          if (payload !== '[DONE]') {
            try {
              const data = JSON.parse(payload);
              if (data.answer) {
                fullAnswer = data.answer;
              }
            } catch (e) {
              // JSON解析エラーは無視
            }
          }
        }
        tryResolve();
      });

      response.data.on('error', (error) => {
        console.error('ストリームエラー:', error.message);
        // エラーが発生しても、取得できた内容があれば返す
        tryResolve();
      });
    });
  } catch (error) {
    console.error('Dify API エラー:', error.response?.data || error.message);
    return 'エラーが発生しました。しばらく時間をおいてから再度お試しください。';
  }
}

// LINEメッセージイベントハンドラー
// 署名検証のために生バイト列(Buffer)を保持するパーサを先に適用する
const lineJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // LINE SDKが署名検証に使用
  },
});

app.post('/webhook', lineJsonParser, line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook エラー:', err);
      res.status(500).end();
    });
});

// イベントハンドラー
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const messageText = event.message.text;

  try {
    // Difyにメッセージを送信
    const difyResponse = await sendToDify(messageText, userId);

    // LINEに応答を送信
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: difyResponse,
    });
  } catch (error) {
    console.error('メッセージ処理エラー:', error);
    
    // エラー時の応答
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '申し訳ございませんが、エラーが発生しました。しばらく時間をおいてから再度お試しください。',
    });
  }
}

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dify + LINE Bot連携ツールが動作中です',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
  console.log(`📱 Webhook URL: https://your-domain.com/webhook`);
  console.log(`🔗 LINE Developer ConsoleでWebhook URLを設定してください`);
});

module.exports = app;
