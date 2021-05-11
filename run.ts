import { getInput, setOutput } from '@actions/core'
import {
	flash,
	connect,
	flashCredentials,
	allSeen,
	progress,
	warn,
	log,
	runCmd,
	atHostHexfile,
	debug,
} from '@nordicsemiconductor/firmware-ci-device-helpers'
import { promises as fs } from 'fs'
import * as path from 'path'

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

const multilineOrUndefined = (s: string): string[] | undefined =>
	s.length > 0 ? s.split('\n') : undefined
const abortOn = multilineOrUndefined(getInput('abort on'))
const endOn = multilineOrUndefined(getInput('end on'))
const endOnWaitSeconds = parseInt(getInput('end on waitSeconds'), 10)

const certDir = getRequiredInput('certificate location')
const flashLogOutput = getRequiredInput('flashLog output')
const deviceLogOutput = getRequiredInput('deviceLog output')

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

const atHost =
	target === 'thingy91_nrf9160ns'
		? atHostHexfile.thingy91
		: atHostHexfile['9160dk']

const main = async () => {
	debug(deviceId, 'appVersion', appVersion)
	debug(deviceId, 'target', target)
	debug(deviceId, 'network', network)
	debug(deviceId, 'secTag', secTag)
	debug(deviceId, 'timeoutInMinutes', timeoutInMinutes)
	debug(deviceId, 'hexFile', hexFile)
	debug(deviceId, 'fotaFile', fotaFile)
	debug(deviceId, 'abortOn', abortOn)
	debug(deviceId, 'endOn', endOn)
	debug(deviceId, 'endOn wait seconds', endOnWaitSeconds)
	debug(deviceId, 'testEnv', testEnv)
	debug(deviceId, certDir)
	debug(deviceId, powerCycle)
	debug(deviceId, 'flashLogOutput', flashLogOutput)
	debug(deviceId, 'deviceLogOutput', deviceLogOutput)

	if (powerCycle.enabled) {
		progress(deviceId, `Power cycling device`)
		progress(deviceId, `Turning off ...`)
		progress(deviceId, powerCycle.offCmd)
		await runCmd({ cmd: powerCycle.offCmd })
		progress(deviceId, `Waiting ${powerCycle.waitSecondsAfterOff} seconds ...`)
		await new Promise((resolve) =>
			setTimeout(resolve, powerCycle.waitSecondsAfterOff * 1000),
		)
		progress(deviceId, `Turning on ...`)
		progress(deviceId, powerCycle.onCmd)
		await runCmd({ cmd: powerCycle.onCmd })

		progress(deviceId, `Waiting ${powerCycle.waitSecondsAfterOn} seconds ...`)
		await new Promise((resolve) =>
			setTimeout(resolve, powerCycle.waitSecondsAfterOn * 1000),
		)
	}

	const outputs = await new Promise<{
		connected: boolean
		timeout: boolean
		abort: boolean
		deviceLog: string[]
		flashLog: string[]
	}>((resolve, reject) => {
		let done = false
		progress(deviceId, `Connecting...`)
		connect({
			device: deviceId,
			atHostHexfile: atHost,
			...log(),
		})
			.then(async ({ connection, deviceLog, onData, onEnd }) => {
				let flashLog: string[] = []
				const credentials = JSON.parse(
					await fs.readFile(
						path.resolve(certDir, `device-${deviceId}.json`),
						'utf-8',
					),
				)

				progress(deviceId, `Setting timeout to ${timeoutInMinutes} minutes`)
				const jobTimeout = setTimeout(async () => {
					done = true
					warn(deviceId, 'Timeout reached.')
					await connection.end()
					resolve({
						connected: true,
						timeout: true,
						abort: false,
						deviceLog,
						flashLog,
					})
				}, timeoutInMinutes * 60 * 1000)

				onEnd(async (_, timeout) => {
					if (timeout) {
						done = true
						clearTimeout(jobTimeout)
						warn(deviceId, 'Device read timeout occurred.')
						resolve({
							connected: true,
							timeout: true,
							abort: false,
							deviceLog,
							flashLog,
						})
					}
					await flash({
						hexfile: atHost,
						...log('Resetting device with AT Host'),
					})
				})
				progress(deviceId, 'Flashing credentials')
				await flashCredentials({
					...credentials,
					...connection,
				})
				flashLog = await flash({
					hexfile: hexFile,
					...log('Flash Firmware'),
				})

				const terminateOn = (type: 'abortOn' | 'endOn', s: string[]) => {
					progress(
						deviceId,
						`<${type}>`,
						`Setting up ${type} traps. Job will terminate if output contains:`,
					)
					s?.map((s) => progress(deviceId, `<${type}>`, s))
					const terminateCheck = allSeen(s)
					onData(async (data) => {
						s?.forEach(async (s) => {
							if (data.includes(s)) {
								warn(deviceId, `<${type}>`, 'Termination criteria seen:', s)
							}
						})
						if (terminateCheck(data)) {
							if (!done) {
								done = true
								warn(
									deviceId,
									`<${type}>`,
									'All termination criteria have been seen.',
								)
								clearTimeout(jobTimeout)
								if (type === 'endOn')
									await new Promise((resolve) =>
										setTimeout(resolve, (endOnWaitSeconds ?? 60) * 1000),
									)
								await connection.end()
								resolve({
									connected: true,
									abort: false,
									timeout: false,
									deviceLog,
									flashLog,
								})
							}
						}
					})
				}

				if (abortOn !== undefined) terminateOn('abortOn', abortOn)
				if (endOn !== undefined) terminateOn('endOn', endOn)
			})
			.catch(reject)
	})
	setOutput('connected', outputs.connected)
	setOutput('abort', outputs.abort)
	setOutput('timeout', outputs.timeout)
	await Promise.all([
		fs.writeFile(deviceLogOutput, outputs.deviceLog.join('\n'), 'utf-8'),
		fs.writeFile(flashLogOutput, outputs.flashLog.join('\n'), 'utf-8'),
	])
}

void main()
