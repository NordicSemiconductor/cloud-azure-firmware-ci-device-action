import { getInput, setOutput } from '@actions/core'

const getRequiredInput = (input: string): string =>
	getInput(input, { required: true })

const deviceId = getRequiredInput('device id')
const appVersion = getRequiredInput('app version')

const target = getRequiredInput('target')
const network = getRequiredInput('network')
const secTag = parseInt(getRequiredInput('sec tag'), 10)
const timeoutInMinutes = parseInt(getRequiredInput('timeout in minutes'), 10)

const hexFile = getRequiredInput('hex file')
const fotaFile = getRequiredInput('fota file')

const abortOn = getInput('abort on')
const end = getInput('end on')

const testEnv = {
	credentials: getRequiredInput('azure credentials'),
	location: getRequiredInput(' azure location'),
	resourceGroup: getRequiredInput('azure resource group'),
	appName: getRequiredInput('app name:'),
}

const main = async () => {
	console.log('deviceId', deviceId)
	console.log('appVersion', appVersion)
	console.log('target', target)
	console.log('network', network)
	console.log('secTag', secTag)
	console.log('timeoutInMinutes', timeoutInMinutes)
	console.log('hexFile', hexFile)
	console.log('fotaFile', fotaFile)
	console.log('abortOn', abortOn)
	console.log('end', end)
	console.log('testEnv', testEnv)
	setOutput('connected', false)
}

void main()
