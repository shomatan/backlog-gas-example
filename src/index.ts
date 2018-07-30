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
		.showModalDialog(html, 'Backlogから自分の課題を取得するサンプルアプリケーション')
}

global.getConfig = function(): Config {
	return getConfig()
}

global.execute = function(config: Config): void {
	// フォームに入力された値を保存し、次回から入力しなくてもいいようにする
	storeConfig(config)

	// プロジェクトユーザー一覧を取得する
	const usersJson = httpGet(`${config.url}/api/v2/projects/${config.projectKey}/users?apiKey=${config.apiKey}`)
	const users = Object.keys(usersJson).map(key => jsonToUser(usersJson[key]))

	throw new Error(users[0].name)
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