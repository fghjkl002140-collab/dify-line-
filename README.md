# Dify + LINE Bot連携ツール

## 概要
Difyで作成したチャットボットをLINE上で動作させるためのツールです。

## 必要な準備

### 1. Difyの設定
1. Difyアカウントを作成し、チャットボットを作成
2. APIキーを取得（Settings > API Keys）
3. チャットボットのAPIエンドポイントURLを確認

### 2. LINE Developer Consoleの設定
1. [LINE Developer Console](https://developers.line.biz/)にアクセス
2. 新しいプロバイダーを作成
3. Messaging APIチャンネルを作成
4. Channel Access TokenとChannel Secretを取得
5. Webhook URLを設定（後で設定）

## 環境変数の設定

`.env`ファイルを作成し、以下の情報を設定してください：

```
# LINE Bot設定
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# Dify設定
DIFY_API_KEY=your_dify_api_key
DIFY_API_URL=https://api.dify.ai/v1/chat-messages

# サーバー設定
PORT=3000
```

## インストールと起動

```bash
# 依存関係をインストール
npm install

# 開発モードで起動
npm run dev

# 本番モードで起動
npm start
```

## デプロイメント

### Herokuでのデプロイ
1. Herokuアカウントを作成
2. Heroku CLIをインストール
3. アプリを作成してデプロイ

### Railwayでのデプロイ
1. Railwayアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定してデプロイ

## 使用方法
1. LINE Botを友達追加
2. メッセージを送信
3. Difyチャットボットからの応答を確認

## トラブルシューティング
- Webhook URLが正しく設定されているか確認
- 環境変数が正しく設定されているか確認
- DifyのAPIキーが有効か確認
- LINE Botの設定が正しいか確認
