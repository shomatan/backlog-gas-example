import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.UrlFetchApp

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
	return getConfig()
}

global.execute = function(config: Config): string {
  // フォームに入力された値を保存し、次回から入力しなくてもいいようにする
  storeConfig(config)

  // プロジェクトユーザー一覧を取得する
  const usersJson = httpGet(`${config.url}/api/v2/projects/${config.projectKey}/users?apiKey=${config.apiKey}`)
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

const jsonToUser = (json: any): User =>
	User(
		json["id"],
		json["userId"],
		json["name"],
		json["mailAddress"]
	)

const httpGet = (uri: string): JSON => {
	const response = doRequest(uri)
	return httpResponseToJson(response)
}

const doRequest = (uri: string, options?: URLFetchRequestOptions): HTTPResponse => {
	if (options == null) return UrlFetchApp.fetch(uri)
	else return UrlFetchApp.fetch(uri, options)
}

const httpResponseToJson = (response: HTTPResponse): JSON => 
	JSON.parse(response.getContentText())

const getUserProperty = (key: string): string =>
	PropertiesService.getUserProperties().getProperty(key)

const setUserProperty = (key: string, value: string): void => {
	PropertiesService.getUserProperties().setProperty(key, value)
}

const getConfig = (): Config =>
	Config(
		getUserProperty('url'),
		getUserProperty('apiKey'),
		getUserProperty('projectKey')	
	)

const storeConfig = (config: Config): void => {
	setUserProperty('url', config.url)
	setUserProperty('apiKey', config.apiKey)
	setUserProperty('projectKey', config.projectKey)
}

export interface Config {
  readonly url: string
	readonly apiKey: string
	readonly projectKey: string
}

export const Config = (url: string, apiKey: string, projectKey: string) => ({url, apiKey, projectKey})

interface User {
	readonly id: number
	readonly userId: string
	readonly name: string
	readonly mailAddress: string
}

const User = (id: number, userId: string, name: string, mailAddress: string) => ({id, userId, name, mailAddress}) 