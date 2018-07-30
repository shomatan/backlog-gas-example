import { UserPropertyService, UserPropertyServiceImpl } from "./UserPropertyService";
import { HttpClientImpl } from "./HttpClient";

declare var global: any

global.onOpen = function() {
  SpreadsheetApp
    .getUi()
    .createMenu('Backlog')
    .addItem('実行フォームを開く', 'showDialog')
    .addToUi()
}

global.showDialog = function() {
  const html = HtmlService
    .createTemplateFromFile('index')
    .evaluate()	

  SpreadsheetApp
    .getUi()
    .showModalDialog(html, 'Backlogからプロジェクトユーザーを取得するサンプルアプリケーション')
}

global.getConfig = function(): Config {
	const propertyService = UserPropertyServiceImpl()
  return getConfigFromProperty(propertyService)
}

global.execute = function(config: Config): string {
	const propertyService = UserPropertyServiceImpl()
	const httpClient = HttpClientImpl()

  // フォームに入力された値を保存し、次回から入力しなくてもいいようにする
  storeConfig(config, propertyService)

  // プロジェクトユーザー一覧を取得する
	const uri = `${config.url}/api/v2/projects/${config.projectKey}/users?apiKey=${config.apiKey}`
	const usersJson = httpClient.get(uri)
  const users = Object.keys(usersJson).map(key => jsonToUser(usersJson[key]))

  // スプレッドシートに新たなシートを追加する
  const sheetName = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd HH:mm:ss")
  const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName, 0)

  // ヘッダーを設定
  sheet.getRange(1, 1).setValue("ID")
  sheet.getRange(1, 2).setValue("ユーザーID")
  sheet.getRange(1, 3).setValue("名前")
  sheet.getRange(1, 4).setValue("メールアドレス")

  // データを出力
  for (let i = 0; i < users.length; i++) {
    const rowNumber = i + 2
    const user = users[i]

    sheet.getRange(rowNumber, 1).setValue(user.id)
    sheet.getRange(rowNumber, 2).setValue(user.userId)
    sheet.getRange(rowNumber, 3).setValue(user.name)
    sheet.getRange(rowNumber, 4).setValue(user.mailAddress)
    SpreadsheetApp.flush()
  }
	return "success"
}

export const jsonToUser = (json: any): User =>
	User(
		json["id"],
		json["userId"],
		json["name"],
		json["mailAddress"]
	)

const getConfigFromProperty = (propertyService: UserPropertyService): Config =>
	Config(
		propertyService.get('url'),
		propertyService.get('apiKey'),
		propertyService.get('projectKey')	
	)

const storeConfig = (config: Config, propertyService: UserPropertyService): void => {
	propertyService.set('url', config.url)
	propertyService.set('apiKey', config.apiKey)
	propertyService.set('projectKey', config.projectKey)
}

interface Config {
  readonly url: string
	readonly apiKey: string
	readonly projectKey: string
}

const Config = (url: string, apiKey: string, projectKey: string) => ({url, apiKey, projectKey})

export interface User {
	readonly id: number
	readonly userId: string
	readonly name: string
	readonly mailAddress: string
}

export const User = (id: number, userId: string, name: string, mailAddress: string) => ({id, userId, name, mailAddress}) 