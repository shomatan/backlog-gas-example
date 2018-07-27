declare var global: any

global.onOpen = function() {
	SpreadsheetApp
		.getUi()
    .createMenu('Backlog')
    .addItem('実行フォームを開く', 'showDialog')
    .addToUi()
}

global.showDialog = function showDialog() {
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

global.execute = function(form: any): void {
	const url = form.url
	const apiKey = form.key
	const projectKey = form.project

	setUserProperty('url', url)
	setUserProperty('apiKey', apiKey)
	setUserProperty('projectKey', projectKey)

}

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

export interface Config {
  readonly url: string
	readonly apiKey: string
	readonly projectKey: string
}

export const Config = (url: string, apiKey: string, projectKey: string) => ({url, apiKey, projectKey})
