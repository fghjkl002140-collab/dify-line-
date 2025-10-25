# Dify + LINE Bot連携ツール セットアップガイド

## 🎯 概要
このツールは、Difyで作成したチャットボットをLINE上で動作させるための連携システムです。初心者の方でも簡単にセットアップできるよう、詳細な手順を説明します。

## 📋 必要な準備

### 1. Difyの設定
1. **Difyアカウントの作成**
   - [Dify](https://dify.ai/)にアクセス
   - アカウントを作成（無料プランでOK）

2. **チャットボットの作成**
   - 新しいアプリケーションを作成
   - チャットボットの設定を完了
   - 動作確認を行う

3. **APIキーの取得**
   - Settings > API Keys に移動
   - 新しいAPIキーを作成
   - APIキーをコピーして保存

4. **APIエンドポイントの確認**
   - 通常は `https://api.dify.ai/v1/chat-messages`
   - カスタムドメインを使用している場合は適宜変更

### 2. LINE Developer Consoleの設定
1. **LINE Developer Consoleにアクセス**
   - [LINE Developer Console](https://developers.line.biz/)にアクセス
   - LINEアカウントでログイン

2. **プロバイダーの作成**
   - 「Create」をクリック
   - プロバイダー名を入力（例：「My Bot Provider」）

3. **Messaging APIチャンネルの作成**
   - 「Create a new channel」をクリック
   - 「Messaging API」を選択
   - 以下の情報を入力：
     - Channel name: ボットの名前
     - Channel description: ボットの説明
     - Category: 適切なカテゴリを選択
     - Subcategory: 適切なサブカテゴリを選択

4. **チャンネル設定の完了**
   - 作成されたチャンネルをクリック
   - 「Messaging API」タブを選択
   - Channel Access TokenとChannel Secretをコピーして保存

## 🚀 ローカル環境でのセットアップ

### 1. プロジェクトのクローン
```bash
# このプロジェクトをダウンロードまたはクローン
cd /Users/saika/Dify
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
1. `env.example`をコピーして`.env`ファイルを作成：
```bash
cp env.example .env
```

2. `.env`ファイルを編集し、以下の情報を設定：
```env
# LINE Bot設定
LINE_CHANNEL_ACCESS_TOKEN=your_actual_channel_access_token
LINE_CHANNEL_SECRET=your_actual_channel_secret

# Dify設定
DIFY_API_KEY=your_actual_dify_api_key
DIFY_API_URL=https://api.dify.ai/v1/chat-messages

# サーバー設定
PORT=3000
```

### 4. ローカルサーバーの起動
```bash
# 開発モードで起動（ファイル変更時に自動再起動）
npm run dev

# または本番モードで起動
npm start
```

### 5. ngrokを使用したWebhook URLの設定
1. **ngrokのインストール**
   - [ngrok](https://ngrok.com/)からダウンロード
   - または `brew install ngrok` (macOS)

2. **ngrokの起動**
```bash
ngrok http 3000
```

3. **Webhook URLの設定**
   - ngrokが表示するHTTPS URLをコピー（例：`https://abc123.ngrok.io`）
   - LINE Developer Consoleの「Messaging API」タブで：
     - Webhook URL: `https://abc123.ngrok.io/webhook`
     - Use webhook: ON
     - Verify: クリックして成功を確認

## 🌐 クラウドデプロイメント

### Herokuでのデプロイ

1. **Herokuアカウントの作成**
   - [Heroku](https://heroku.com/)でアカウント作成

2. **Heroku CLIのインストール**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# または公式サイトからダウンロード
```

3. **Herokuにログイン**
```bash
heroku login
```

4. **アプリケーションの作成**
```bash
heroku create your-app-name
```

5. **環境変数の設定**
```bash
heroku config:set LINE_CHANNEL_ACCESS_TOKEN=your_token
heroku config:set LINE_CHANNEL_SECRET=your_secret
heroku config:set DIFY_API_KEY=your_api_key
heroku config:set DIFY_API_URL=https://api.dify.ai/v1/chat-messages
```

6. **デプロイ**
```bash
git add .
git commit -m "Initial commit"
git push heroku main
```

7. **Webhook URLの設定**
   - HerokuアプリのURLを確認：`https://your-app-name.herokuapp.com`
   - LINE Developer ConsoleでWebhook URLを設定：`https://your-app-name.herokuapp.com/webhook`

### Railwayでのデプロイ

1. **Railwayアカウントの作成**
   - [Railway](https://railway.app/)でアカウント作成

2. **GitHubリポジトリとの連携**
   - このプロジェクトをGitHubにプッシュ
   - RailwayでGitHubリポジトリを選択

3. **環境変数の設定**
   - Railwayダッシュボードで環境変数を設定

4. **デプロイ**
   - 自動的にデプロイが開始されます

5. **Webhook URLの設定**
   - Railwayが提供するURLをLINE Developer Consoleで設定

## 🧪 テスト方法

### 1. ヘルスチェック
```bash
curl https://your-domain.com/health
```

### 2. LINE Botのテスト
1. LINE Developer Consoleで「Messaging API」タブを開く
2. QRコードをスキャンしてボットを友達追加
3. メッセージを送信して応答を確認

### 3. ログの確認
- Heroku: `heroku logs --tail`
- Railway: ダッシュボードのLogsタブ
- ローカル: ターミナルの出力

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **Webhook URLエラー**
   - URLが正しいか確認
   - HTTPSを使用しているか確認
   - ngrokが起動しているか確認

2. **Dify APIエラー**
   - APIキーが正しいか確認
   - API URLが正しいか確認
   - Difyのチャットボットが有効か確認

3. **LINE Bot応答なし**
   - Channel Access Tokenが正しいか確認
   - Channel Secretが正しいか確認
   - Webhookが有効になっているか確認

4. **環境変数エラー**
   - `.env`ファイルが正しい場所にあるか確認
   - 環境変数名が正しいか確認
   - 値に余分なスペースがないか確認

## 📞 サポート

問題が解決しない場合は、以下の情報を含めてお問い合わせください：
- エラーメッセージ
- ログの内容
- 使用している環境（ローカル/Heroku/Railway）
- 設定した環境変数（機密情報は除く）

## 🔄 更新履歴

- v1.0.0: 初回リリース
  - DifyとLINE Botの基本連携機能
  - Heroku/Railway対応
  - エラーハンドリング機能
