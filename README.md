# 実装して理解する LINE Login と OpenID Connect 入門
作成：2019/03/14  
更新：同上  

[LINE開発者コミュニティ](https://linedevelopercommunity.connpass.com/)で実施するLINE Login講座の実習資料です。  
本サンプルはOpenID Connectのフローを理解することを目的としています。そのため、OpenID Connectのフロー（具体的にはエンドポイントの呼び出し）を途中で止めており、通常のアプリケーションの作り方とは異なりますので注意してください。
- 2019/03/15（金）[実装して理解する LINE Login と OpenID Connect 入門 #1](https://linedevelopercommunity.connpass.com/event/121596/)  

**免責事項**
- 本サンプルコードは学習用のコードであり、本サンプルコードを利用したことにより発生するいかなる損害についても補償は致しません  
- 本サンプルコードの不具合などがありましたらIssue等でご連絡ください。ベストエフォートで対応するかもしれませんし、しないかもしれません。  

## 実習用コード
### 準備
#### 必要物
- node.js(v10.13.0で動作確認済み)
- Visual Studio Code(1.32.1 for Windowsで作成)
- git(2.19.2.windows.1で動作確認)
- LINEアカウント
- [LINE Developers Console](https://developers.line.biz/console/)へのアクセスが出来ること
#### 導入
##### LINE Developers Consoleでプロバイダを作成
1. [LINE Developers Console](https://developers.line.biz/console/)へアクセスしログオンする  
初めての方は開発者名とメールアドレスを入力して開発者登録をしてください。  
2. 新規プロバイダ作成をクリックしてプロバイダを作成する  
![新規プロバイダ作成](https://github.com/fujie/line_login/blob/media/1.provider.png)  
3. プロバイダ名を入力して新規プロバイダを作成する  
注意点：プロバイダ名に「LINE」という文字列を含めることは出来ません。  
![プロバイダ名登録](https://github.com/fujie/line_login/blob/media/2.create_provider.png)  
4. 新規LINEログオンのチャネルを作成する  
![新規チャネル作成](https://github.com/fujie/line_login/blob/media/3.new_channel.png)  
以下の情報を入力してチャネルを作成する  
- アプリ名：任意の名称
- 説明：任意の説明
- アプリタイプ：今回は「WEBで使う」を選択
- メールアドレス：ご自身のメールアドレス
![チャネル登録](https://github.com/fujie/line_login/blob/media/4.create_channel.png)  
5. チャネルの設定を行う  
以下の設定を行う  
- OpenID Connect -> メールアドレスの申請  
 - 各種ガイドラインへの同意にチェック  
 - ユーザにメールアドレス取得に関する同意を取得している画面等のスクリーンショットのアップロード  
![メールアドレス申請](https://github.com/fujie/line_login/blob/media/5.email.png)  
![同意](https://github.com/fujie/line_login/blob/media/6.consent.png)  
テスト用なの適当な(笑)画像を作ってアップロードします。  
![画像](https://github.com/fujie/line_login/blob/media/7.consent.png)  
6. 必要な情報をメモする  
後で使うので、以下の2つの情報をメモしておきます。  
- Channel ID（client_idに相当）
- Channel Secret（client_secretに相当）
7. OpenID Connect RPの情報を登録する  
アプリ設定のタブを開き、Callback URLの編集をクリック、今回のテストアプリのコールバックURLを登録します。  
今回のアプリは`http://localhost:3000/cb`を使います。  
![コールバックURL](https://github.com/fujie/line_login/blob/media/8.redirect_uri.png)  
8. チャネルの公開  
設定が終わったチャネルを公開します。  
![公開](https://github.com/fujie/line_login/blob/media/8.publish.png)  

##### コードのクローン～セットアップ
1. ローカルの任意の場所に新規フォルダを作成する  
2. Visual Studio Codeを開き、作成したフォルダをVisual Studio Code上へドラッグ＆ドロップする  
3. `CTRL+@`でターミナルを開く  
4. 本レポジトリをローカルにクローン  
`git clone https://github.com/fujie/line_login.git`
5. index.jsのコードを修正する
![Channel ID/Secret](https://github.com/fujie/line_login/blob/media/9.modify.png)  
6. ターミナルでline_loginフォルダへ移動する  
`cd line_login`
7. index.jsを実行する  
`node index.js`

##### 動作確認
1. ブラウザで`http://localhost:3000`を開く  
![起動](https://github.com/fujie/line_login/blob/media/10.initialize.png)  
2. loginボタンをクリックするとLINEログイン画面へ遷移する  
![ログイン](https://github.com/fujie/line_login/blob/media/11.login.png)  
3. QRコードログインを選択する  
![QRログイン](https://github.com/fujie/line_login/blob/media/11.qrlogin.png)  
4. スマホのLINEの友だち追加用のQRリーダでQRを読み込む  
5. 表示される番号をスマホ側に入力する  
![ログインコード](https://github.com/fujie/line_login/blob/media/12.login.png)  
6. 属性取得に関する同意画面が出るので同意する  
![同意](https://github.com/fujie/line_login/blob/media/13.login.png)  
7. 認可コードが取得できるので、`exchange code to token`をクリックする  
![認可コード](https://github.com/fujie/line_login/blob/media/14.code.png)  
8. トークン（access_token, refresh_token, id_token）が取得できる  
![トークン](https://github.com/fujie/line_login/blob/media/15.token.png)  
9. id_tokenのリンクをクリックし、id_tokenの内容を確認する  
新しいタブが開き、[https://jwt.ms](https://jwt.ms)で取得したid_tokenの中身が確認できる  
![IDトークン](https://github.com/fujie/line_login/blob/media/16.id_token.png)  
10. 元のタブに戻り、`get userinfo`をクリックし、プロファイルを取得する  
![userinfo](https://github.com/fujie/line_login/blob/media/17.userinfo.png)  


