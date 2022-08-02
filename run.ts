import { getInput, setOutput } from '@actions/core'
import { spawn } from 'child_process'
import * as fs from 'fs'

const getRequiredInput = (input: string): string =>
	getInput(input, { required: true }).trim()

const deviceId = getRequiredInput('device id')
const appVersion = getRequiredInput('app version')

const target = getRequiredInput('target')
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
const jobLocation = getRequiredInput('job output')

const testEnv = {
	appName: getRequiredInput('app name'),
	storageAccountName: getRequiredInput('storage account name'),
}

let tries = parseInt(getRequiredInput('tries'), 10)
console.log(`Retries: ${tries}`)
let numTry = 0

const powerCycle:
	| {
			offCmd: string
			onCmd: string
			waitSecondsAfterOff: number
			waitSecondsAfterOn: number
	  }
	| undefined =
	getRequiredInput('powerCycle enabled') === 'true'
		? {
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
		: undefined

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
	powerCycle,
	flashLogLocation,
	deviceLogLocation,
}

console.log(JSON.stringify(job, null, 2))
fs.writeFileSync(jobLocation, JSON.stringify(job, null, 2), 'utf-8')

const ciRunnerPackage = getInput('ci runner package').trim()

const run = async () => {
	tries--
	numTry++
	const p = spawn(
		'npm',
		[
			'exec',
			'--',
			ciRunnerPackage.length > 0
				? ciRunnerPackage
				: '@nordicsemiconductor/firmware-ci-runner-azure',
		],
		{
			shell: true,
		},
	)
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
			setOutput('timeout', true)
			setOutput('try', numTry)
			process.exit(-108)
		}
		if (code === 0) process.exit() // Success
		if (tries > 0) {
			console.debug(`Retrying ...`)
			void run()
			return
		}
		setOutput('try', numTry)
		process.exit(code === null ? -109 : code)
	})
	p.stdin.write(JSON.stringify(job))
	p.stdin.end()
}

void run()
