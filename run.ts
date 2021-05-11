import { getInput, setOutput } from '@actions/core'
import { spawn } from 'child_process'

const getRequiredInput = (input: string): string =>
	getInput(input, { required: true }).trim()

const deviceId = getRequiredInput('device id')
const appVersion = getRequiredInput('app version')

const target = getRequiredInput('target')
const network = getRequiredInput('network')
const secTag = parseInt(getRequiredInput('sec tag'), 10)
const timeoutInMinutes = parseInt(getRequiredInput('timeout in minutes'), 10)

const hexFile = getRequiredInput('hex file')
const fotaFile = getRequiredInput('fota file')

const multilineOrUndefined = (s: string): string[] | undefined =>
	s.length > 0 ? s.split('\n') : undefined
const abortOn = multilineOrUndefined(getInput('abort on'))
const endOn = multilineOrUndefined(getInput('end on'))
const endOnWaitSeconds = parseInt(getInput('end on waitSeconds'), 10)

const certDir = getRequiredInput('certificate location')
const flashLogLocation = getRequiredInput('flashLog output')
const deviceLogLocation = getRequiredInput('deviceLog output')

const testEnv = {
	credentials: getRequiredInput('azure credentials'),
	location: getRequiredInput('azure location'),
	resourceGroup: getRequiredInput('azure resource group'),
	appName: getRequiredInput('app name'),
}

const powerCycle = {
	enabled: getRequiredInput('powerCycle enabled') === 'true',
	offCmd: getRequiredInput('powerCycle offCmd'),
	onCmd: getRequiredInput('powerCycle onCmd'),
	waitSecondsAfterOff: parseInt(
		getRequiredInput('powerCycle waitSecondsAfterOff'),
		10,
	),
	waitSecondsAfterOn: parseInt(
		getRequiredInput('powerCycle waitSecondsAfterOn'),
		10,
	),
}

const job = {
	deviceId,
	appVersion,
	testEnv,
	hexFile,
	fotaFile,
	abortOn,
	endOn,
	endOnWaitSeconds,
	timeoutInMinutes,
	secTag,
	certDir,
	target,
	network,
	powerCycle,
	flashLogLocation,
	deviceLogLocation,
}

console.log(JSON.stringify(job, null, 2))

const p = spawn('npm', [
	'exec',
	'--',
	'@nordicsemiconductor/firmware-ci-runner-azure',
])
let timedOut = false
const t = setTimeout(() => {
	p.kill('SIGHUP')
	timedOut = true
}, timeoutInMinutes * 60 * 1000)
const data: string[] = []
p.stdout.on('data', (d) => {
	console.log(d.toString())
	data.push(d.toString())
})
const error: string[] = []
p.stderr.on('data', (d) => {
	console.error(d.toString())
	error.push(d.toString())
})
p.on('close', (code) => {
	clearTimeout(t)
	setOutput('connected', code === 0)
	if (timedOut) {
		console.error('Timed out.')
		process.exit(-108)
	}
	process.exit(code === null ? -109 : code)
})
p.stdin.write(JSON.stringify(job))
