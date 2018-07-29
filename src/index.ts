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
	storeConfig(config)

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
