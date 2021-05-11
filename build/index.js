/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2087));
const path = __importStar(__nccwpck_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(5747));
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4923:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.atHostHexfile = void 0;
const path = __nccwpck_require__(5622);
const fs_1 = __nccwpck_require__(5747);
exports.atHostHexfile = {
    thingy91: path.join(path.dirname(fs_1.realpathSync(__filename)), '..', '..', 'at_client', 'thingy91_at_client_increased_buf.hex'),
    '9160dk': path.join(path.dirname(fs_1.realpathSync(__filename)), '..', '..', 'at_client', '91dk_at_client_increased_buf.hex'),
};


/***/ }),

/***/ 3492:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.atCMD = void 0;
const trim = (data) => data.trim().replace(/\u0000/g, '');
const atCMD = ({ device, port, parser, delimiter, progress, }) => async (cmd) => new Promise((resolve, reject) => {
    const ATCmdResult = [];
    const dataHandler = (data) => {
        progress === null || progress === void 0 ? void 0 : progress('<AT', data);
        const d = trim(data);
        if (d === 'OK') {
            parser.off('data', dataHandler);
            return resolve(ATCmdResult);
        }
        if (d === 'ERROR') {
            parser.off('data', dataHandler);
            return reject(new Error(`AT command ${cmd} failed on ${device}: ERROR after write.`));
        }
        ATCmdResult.push(d);
    };
    parser.on('data', dataHandler);
    port.write(`${cmd}${delimiter}`, (err) => {
        if (err) {
            parser.off('data', dataHandler);
            return reject(new Error(`Failed to send AT command ${cmd} failed to ${device}: ${err.message}`));
        }
        progress === null || progress === void 0 ? void 0 : progress('AT>', cmd);
    });
});
exports.atCMD = atCMD;


/***/ }),

/***/ 3497:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.connect = void 0;
const SerialPort = __nccwpck_require__(5998);
const Readline = __nccwpck_require__(8697);
const atCMD_1 = __nccwpck_require__(3492);
const flash_1 = __nccwpck_require__(6890);
const defaultInactivityTimeoutInSeconds = 300;
const connect = async ({ device, delimiter, atHostHexfile, progress, debug, warn, port, inactivityTimeoutInSeconds, }) => new Promise((resolve, reject) => {
    const deviceLog = [];
    const timeoutSeconds = inactivityTimeoutInSeconds !== null && inactivityTimeoutInSeconds !== void 0 ? inactivityTimeoutInSeconds : defaultInactivityTimeoutInSeconds;
    progress === null || progress === void 0 ? void 0 : progress(`Connecting to`, device);
    progress === null || progress === void 0 ? void 0 : progress(`Inactivity timeout`, `${timeoutSeconds} seconds`);
    let onEnd;
    const portInstance = port !== null && port !== void 0 ? port : new SerialPort(device, {
        baudRate: 115200,
        autoOpen: true,
        dataBits: 8,
        lock: true,
        stopBits: 1,
        parity: 'none',
        rtscts: false,
    });
    const parser = portInstance.pipe(new Readline({ delimiter: delimiter !== null && delimiter !== void 0 ? delimiter : '\r\n' }));
    const at = atCMD_1.atCMD({
        device,
        port: portInstance,
        parser,
        delimiter: delimiter !== null && delimiter !== void 0 ? delimiter : '\r\n',
        progress: (...args) => {
            deviceLog.push(`${new Date().toISOString()}\t${args.join('\t')}`);
            progress === null || progress === void 0 ? void 0 : progress(device, ...args);
        },
    });
    let inactivityTimer;
    let ended = false;
    const end = async (timeout) => {
        ended = true;
        onEnd === null || onEnd === void 0 ? void 0 : onEnd(portInstance, timeout);
        if (!portInstance.isOpen) {
            warn === null || warn === void 0 ? void 0 : warn(device, 'port is not open');
            return;
        }
        progress === null || progress === void 0 ? void 0 : progress(device, 'closing port');
        portInstance.close();
        progress === null || progress === void 0 ? void 0 : progress(device, 'port closed');
    };
    const onInactive = () => {
        warn === null || warn === void 0 ? void 0 : warn(device, `No data received after ${timeoutSeconds} seconds`);
        void end(true);
    };
    portInstance.on('open', async () => {
        progress === null || progress === void 0 ? void 0 : progress(device, `connected`);
        void flash_1.flash({
            hexfile: atHostHexfile,
            debug: (...args) => debug === null || debug === void 0 ? void 0 : debug('AT Host', ...args),
            warn: (...args) => warn === null || warn === void 0 ? void 0 : warn('AT Host', ...args),
        });
        inactivityTimer = setTimeout(onInactive, timeoutSeconds * 1000);
    });
    const listeners = [];
    parser.on('data', async (data) => {
        debug === null || debug === void 0 ? void 0 : debug(device, data);
        deviceLog.push(`${new Date().toISOString()}\t${data.trimEnd()}`);
        listeners.map((l) => l(data));
        if (data.includes('The AT host sample started')) {
            resolve({
                connection: {
                    at,
                    end: async () => end(false),
                },
                deviceLog,
                onData: (fn) => {
                    listeners.push(fn);
                },
                onEnd: (fn) => {
                    onEnd = fn;
                },
            });
        }
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(onInactive, timeoutSeconds * 1000);
    });
    portInstance.on('close', () => {
        if (ended) {
            progress === null || progress === void 0 ? void 0 : progress(device, 'port closed');
        }
        else {
            warn === null || warn === void 0 ? void 0 : warn(device, 'port closed unexpectedly');
            onEnd === null || onEnd === void 0 ? void 0 : onEnd(portInstance, false);
        }
    });
    portInstance.on('error', (err) => {
        warn === null || warn === void 0 ? void 0 : warn(device, err.message);
        reject(err);
    });
});
exports.connect = connect;


/***/ }),

/***/ 6890:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.flash = void 0;
const fs_1 = __nccwpck_require__(5747);
const child_process_1 = __nccwpck_require__(3129);
const path = __nccwpck_require__(5622);
const os = __nccwpck_require__(2087);
const uuid_1 = __nccwpck_require__(5840);
const seggerFlashScript = (fwFile) => `h 
w4 4001e504 2
w4 4001e50c 1
sleep 100
rx 1000
h
w4 4001e504 1
loadfile ${fwFile}
rx 1000
g
exit`;
const flash = async ({ hexfile, warn, debug, }) => {
    const script = path.join(os.tmpdir(), `${uuid_1.v4()}.script`);
    await fs_1.promises.writeFile(script, seggerFlashScript(hexfile), 'utf-8');
    debug === null || debug === void 0 ? void 0 : debug(seggerFlashScript(hexfile));
    return new Promise((resolve, reject) => {
        const flash = child_process_1.spawn('JLinkExe', [
            '-device',
            'nrf9160',
            '-if',
            'SWD',
            '-speed',
            '1000',
            script,
        ]);
        const log = [];
        let timedOut = false;
        const t = setTimeout(() => {
            flash.kill('SIGHUP');
            timedOut = true;
            return reject(new Error(`Timeout while waiting for flashing to complete.`));
        }, 60 * 1000);
        flash.stdout.on('data', (data) => {
            data
                .toString()
                .trim()
                .split('\n')
                .filter((s) => s.length)
                .map((s) => {
                debug === null || debug === void 0 ? void 0 : debug(s);
                log.push(s);
            });
        });
        flash.stderr.on('data', (data) => {
            data
                .toString()
                .trim()
                .split('\n')
                .filter((s) => s.length)
                .map((s) => warn === null || warn === void 0 ? void 0 : warn(s));
        });
        flash.on('exit', () => {
            clearTimeout(t);
            if (log.join('\n').includes('Failed to open file.')) {
                warn === null || warn === void 0 ? void 0 : warn(`Failed to open file: ${hexfile}`);
                return reject();
            }
            if (log.join('\n').includes('Script processing completed.')) {
                resolve(log);
            }
            else if (!timedOut) {
                reject(new Error('Flashing did not succeed for unknown reasons.'));
            }
        });
    });
};
exports.flash = flash;


/***/ }),

/***/ 6228:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.flashCredentials = void 0;
const flashCredentials = async ({ at, secTag, privateKey, clientCert, caCert, }) => {
    await at('AT+CFUN=4');
    await at(`AT%CMNG=0,${secTag},0,"${caCert.replace(/\n/g, '\r\n')}"`);
    await at(`AT%CMNG=0,${secTag},1,"${clientCert.replace(/\n/g, '\r\n')}"`);
    await at(`AT%CMNG=0,${secTag},2,"${privateKey.replace(/\n/g, '\r\n')}"`);
    await at('AT+CFUN=1');
};
exports.flashCredentials = flashCredentials;


/***/ }),

/***/ 2233:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(3492), exports);
__exportStar(__nccwpck_require__(3497), exports);
__exportStar(__nccwpck_require__(6228), exports);
__exportStar(__nccwpck_require__(6890), exports);


/***/ }),

/***/ 2850:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(2233), exports);
__exportStar(__nccwpck_require__(4923), exports);
__exportStar(__nccwpck_require__(7813), exports);
__exportStar(__nccwpck_require__(3594), exports);
__exportStar(__nccwpck_require__(5169), exports);
__exportStar(__nccwpck_require__(3206), exports);


/***/ }),

/***/ 7813:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.allSeen = void 0;
const allSeen = (matches) => {
    let n = 0;
    const seen = matches.reduce((seen, s) => ({
        ...seen,
        [s]: {
            line: -Number.MAX_SAFE_INTEGER,
            pos: -1,
        },
    }), {});
    return (line) => {
        n++;
        matches.forEach((match) => {
            const pos = line.indexOf(match);
            if (pos >= 0)
                seen[match] = {
                    line: n,
                    pos,
                };
        });
        return (matches
            .map((match, k) => {
            var _a, _b, _c, _d, _e, _f;
            return seen[match].line >= ((_b = (_a = seen[matches[k - 1]]) === null || _a === void 0 ? void 0 : _a.line) !== null && _b !== void 0 ? _b : 0) &&
                (seen[match].line !== ((_d = (_c = seen[matches[k - 1]]) === null || _c === void 0 ? void 0 : _c.line) !== null && _d !== void 0 ? _d : 0) ||
                    seen[match].pos >= ((_f = (_e = seen[matches[k - 1]]) === null || _e === void 0 ? void 0 : _e.pos) !== null && _f !== void 0 ? _f : 0));
        })
            .find((m) => m === false) === undefined);
    };
};
exports.allSeen = allSeen;


/***/ }),

/***/ 3594:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.download = void 0;
const path = __nccwpck_require__(5622);
const os = __nccwpck_require__(2087);
const child_process_1 = __nccwpck_require__(3129);
const log_1 = __nccwpck_require__(5169);
const download = async (jobId, fw) => new Promise((resolve, reject) => {
    const outfile = path.join(os.tmpdir(), `${jobId}.hex`);
    log_1.progress(jobId, 'Downloading HEX file from', fw);
    log_1.progress(jobId, 'Downloading HEX file to', outfile);
    const reset = child_process_1.spawn('curl', ['-L', '-s', fw, '-o', outfile]);
    reset.stdout.on('data', (data) => {
        data
            .toString()
            .trim()
            .split('\n')
            .filter((s) => s.length)
            .map((s) => log_1.progress(jobId, 'Download HEX file', s));
    });
    reset.stderr.on('data', (data) => {
        data
            .toString()
            .trim()
            .split('\n')
            .filter((s) => s.length)
            .map((s) => log_1.warn(jobId, 'Download HEX file', s));
    });
    reset.on('exit', (code) => {
        if (code === 0) {
            log_1.success(jobId, 'Download HEX file', 'succeeded');
            resolve(outfile);
        }
        else {
            log_1.warn(jobId, 'Failed to download', fw);
            reject();
        }
    });
});
exports.download = download;


/***/ }),

/***/ 5169:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.log = exports.debug = exports.success = exports.progress = exports.warn = void 0;
const chalk = __nccwpck_require__(8818);
const stringify = (a) => (typeof a === 'object' ? JSON.stringify(a) : a);
const warn = (...args) => console.warn(chalk.grey(`[${new Date().toISOString()}]`), ...args.map((arg) => chalk.yellow(stringify(arg))));
exports.warn = warn;
const progress = (...args) => console.info(chalk.grey(`[${new Date().toISOString()}]`), ...args.map((arg) => chalk.blue(stringify(arg))), chalk.blue.dim('...'));
exports.progress = progress;
const success = (...args) => console.info(chalk.grey(`[${new Date().toISOString()}]`), ...args.map((arg) => chalk.green(stringify(arg))));
exports.success = success;
const debug = (...args) => console.debug(chalk.grey(`[${new Date().toISOString()}]`), ...args.map((arg) => chalk.magenta(stringify(arg))));
exports.debug = debug;
const notEmpty = (s) => s !== undefined;
const log = (...prefixes) => ({
    warn: (...args) => exports.warn(...[...prefixes, ...args].filter(notEmpty)),
    progress: (...args) => exports.progress(...[...prefixes, ...args].filter(notEmpty)),
    success: (...args) => exports.success(...[...prefixes, ...args].filter(notEmpty)),
    debug: (...args) => exports.debug(...[...prefixes, ...args].filter(notEmpty)),
});
exports.log = log;


/***/ }),

/***/ 3206:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runCmd = void 0;
const child_process_1 = __nccwpck_require__(3129);
const shell_quote_1 = __nccwpck_require__(7029);
const log_1 = __nccwpck_require__(5169);
const runCmd = async ({ cmd, timeoutInSeconds, }) => new Promise((resolve, reject) => {
    const [program, ...args] = shell_quote_1.parse(cmd);
    const p = child_process_1.spawn(program, args);
    let timedOut = false;
    const t = setTimeout(() => {
        p.kill('SIGHUP');
        timedOut = true;
    }, (timeoutInSeconds !== null && timeoutInSeconds !== void 0 ? timeoutInSeconds : 60) * 1000);
    const data = [];
    p.stdout.on('data', (d) => {
        log_1.progress(cmd, d.toString());
        data.push(d.toString());
    });
    const error = [];
    p.stderr.on('data', (d) => {
        log_1.warn(cmd, d.toString());
        error.push(d.toString());
    });
    p.on('close', (code) => {
        clearTimeout(t);
        if (timedOut)
            return reject(new Error(`Timeout while running command '${cmd}'.`));
        if (code === 0)
            return resolve(data.join('\n'));
        reject(error.join('\n'));
    });
});
exports.runCmd = runCmd;


/***/ }),

/***/ 5892:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const debug = __nccwpck_require__(8237)('serialport/binding-abstract')

/**
 * @name Binding
 * @type {AbstractBinding}
 * @since 5.0.0
 * @description The `Binding` is how Node-SerialPort talks to the underlying system. By default, we auto detect Windows, Linux and OS X, and load the appropriate module for your system. You can assign `SerialPort.Binding` to any binding you like. Find more by searching at [npm](https://npmjs.org/).
  Prevent auto loading the default bindings by requiring SerialPort with:
  ```js
  var SerialPort = require('@serialport/stream');
  SerialPort.Binding = MyBindingClass;
  ```
 */

/**
 * You never have to use `Binding` objects directly. SerialPort uses them to access the underlying hardware. This documentation is geared towards people who are making bindings for different platforms. This class can be inherited from to get type checking for each method.
 * @class AbstractBinding
 * @param {object} options options for the binding
 * @property {boolean} isOpen Required property. `true` if the port is open, `false` otherwise. Should be read-only.
 * @throws {TypeError} When given invalid arguments, a `TypeError` is thrown.
 * @since 5.0.0
 */
class AbstractBinding {
  /**
   * Retrieves a list of available serial ports with metadata. The `path` must be guaranteed, and all other fields should be undefined if unavailable. The `path` is either the path or an identifier (eg `COM1`) used to open the serialport.
   * @returns {Promise} resolves to an array of port [info objects](#module_serialport--SerialPort.list).
   */
  static async list() {
    debug('list')
  }

  constructor(opt = {}) {
    if (typeof opt !== 'object') {
      throw new TypeError('"options" is not an object')
    }
  }

  /**
   * Opens a connection to the serial port referenced by the path.
   * @param {string} path the path or com port to open
   * @param {openOptions} options openOptions for the serialport
   * @returns {Promise} Resolves after the port is opened and configured.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async open(path, options) {
    if (!path) {
      throw new TypeError('"path" is not a valid port')
    }

    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('open')

    if (this.isOpen) {
      throw new Error('Already open')
    }
  }

  /**
   * Closes an open connection
   * @returns {Promise} Resolves once the connection is closed.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async close() {
    debug('close')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Request a number of bytes from the SerialPort. This function is similar to Node's [`fs.read`](http://nodejs.org/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback) except it will always return at least one byte.

The in progress reads must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} buffer Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @param {integer} offset The offset in the buffer to start writing at.
   * @param {integer} length Specifies the maximum number of bytes to read.
   * @returns {Promise} Resolves with the number of bytes read after a read operation.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async read(buffer, offset, length) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    if (typeof offset !== 'number' || isNaN(offset)) {
      throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`)
    }

    if (typeof length !== 'number' || isNaN(length)) {
      throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`)
    }

    debug('read')
    if (buffer.length < offset + length) {
      throw new Error('buffer is too small')
    }

    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Write bytes to the SerialPort. Only called when there is no pending write operation.

The in progress writes must error when the port is closed with an error object that has the property `canceled` equal to `true`. Any other error will cause a disconnection.

   * @param {buffer} buffer - Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object.
   * @returns {Promise} Resolves after the data is passed to the operating system for writing.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async write(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('"buffer" is not a Buffer')
    }

    debug('write', buffer.length, 'bytes')
    if (!this.isOpen) {
      debug('write', 'error port is not open')

      throw new Error('Port is not open')
    }
  }

  /**
   * Changes connection settings on an open port. Only `baudRate` is supported.
   * @param {object=} options Only supports `baudRate`.
   * @param {number=} [options.baudRate] If provided a baud rate that the bindings do not support, it should reject.
   * @returns {Promise} Resolves once the port's baud rate changes.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async update(options) {
    if (typeof options !== 'object') {
      throw TypeError('"options" is not an object')
    }

    if (typeof options.baudRate !== 'number') {
      throw new TypeError('"options.baudRate" is not a number')
    }

    debug('update')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Set control flags on an open port.
   * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. All options are always provided.
   * @param {Boolean} [options.brk=false] flag for brk
   * @param {Boolean} [options.cts=false] flag for cts
   * @param {Boolean} [options.dsr=false] flag for dsr
   * @param {Boolean} [options.dtr=true] flag for dtr
   * @param {Boolean} [options.rts=true] flag for rts
   * @param {Boolean} [options.lowLatency=false] flag for lowLatency mode on Linux
   * @returns {Promise} Resolves once the port's flags are set.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async set(options) {
    if (typeof options !== 'object') {
      throw new TypeError('"options" is not an object')
    }
    debug('set')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Get the control flags (CTS, DSR, DCD) on the open port.
   * @returns {Promise} Resolves with the retrieved flags.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async get() {
    debug('get')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Get the OS reported baud rate for the open port.
   * Used mostly for debugging custom baud rates.
   * @returns {Promise} Resolves with the current baud rate.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async getBaudRate() {
    debug('getbaudRate')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Flush (discard) data received but not read, and written but not transmitted.
   * @returns {Promise} Resolves once the flush operation finishes.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async flush() {
    debug('flush')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }

  /**
   * Drain waits until all output data is transmitted to the serial port. An in progress write should be completed before this returns.
   * @returns {Promise} Resolves once the drain operation finishes.
   * @rejects {TypeError} When given invalid arguments, a `TypeError` is rejected.
   */
  async drain() {
    debug('drain')
    if (!this.isOpen) {
      throw new Error('Port is not open')
    }
  }
}

module.exports = AbstractBinding


/***/ }),

/***/ 9173:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { promisify } = __nccwpck_require__(1669)
const binding = require(__nccwpck_require__.ab + "build/Release/bindings.node")
const AbstractBinding = __nccwpck_require__(5892)
const Poller = __nccwpck_require__(628)
const unixRead = __nccwpck_require__(2822)
const unixWrite = __nccwpck_require__(1540)
const { wrapWithHiddenComName } = __nccwpck_require__(700)

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0,
})

const asyncList = promisify(binding.list)
const asyncOpen = promisify(binding.open)
const asyncClose = promisify(binding.close)
const asyncUpdate = promisify(binding.update)
const asyncSet = promisify(binding.set)
const asyncGet = promisify(binding.get)
const asyncGetBaudRate = promisify(binding.getBaudRate)
const asyncDrain = promisify(binding.drain)
const asyncFlush = promisify(binding.flush)

/**
 * The Darwin binding layer for OSX
 */
class DarwinBinding extends AbstractBinding {
  static list() {
    return wrapWithHiddenComName(asyncList())
  }

  constructor(opt = {}) {
    super(opt)
    this.bindingOptions = { ...defaultBindingOptions, ...opt.bindingOptions }
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async open(path, options) {
    await super.open(path, options)
    this.openOptions = { ...this.bindingOptions, ...options }
    const fd = await asyncOpen(path, this.openOptions)
    this.fd = fd
    this.poller = new Poller(fd)
  }

  async close() {
    await super.close()
    const fd = this.fd
    this.poller.stop()
    this.poller.destroy()
    this.poller = null
    this.openOptions = null
    this.fd = null
    return asyncClose(fd)
  }

  async read(buffer, offset, length) {
    await super.read(buffer, offset, length)
    return unixRead({ binding: this, buffer, offset, length })
  }

  async write(buffer) {
    this.writeOperation = super.write(buffer).then(async () => {
      if (buffer.length === 0) {
        return
      }
      await unixWrite({ binding: this, buffer })
      this.writeOperation = null
    })
    return this.writeOperation
  }

  async update(options) {
    await super.update(options)
    return asyncUpdate(this.fd, options)
  }

  async set(options) {
    await super.set(options)
    return asyncSet(this.fd, options)
  }

  async get() {
    await super.get()
    return asyncGet(this.fd)
  }

  async getBaudRate() {
    await super.get()
    return asyncGetBaudRate(this.fd)
  }

  async drain() {
    await super.drain()
    await this.writeOperation
    return asyncDrain(this.fd)
  }

  async flush() {
    await super.flush()
    return asyncFlush(this.fd)
  }
}

module.exports = DarwinBinding


/***/ }),

/***/ 2981:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const debug = __nccwpck_require__(8237)('serialport/bindings')

switch (process.platform) {
  case 'win32':
    debug('loading WindowsBinding')
    module.exports = __nccwpck_require__(1098)
    break
  case 'darwin':
    debug('loading DarwinBinding')
    module.exports = __nccwpck_require__(9173)
    break
  default:
    debug('loading LinuxBinding')
    module.exports = __nccwpck_require__(163)
}


/***/ }),

/***/ 700:
/***/ ((module) => {

let warningSent = false

const wrapWithHiddenComName = async portsPromise => {
  const ports = await portsPromise
  return ports.map(port => {
    const newPort = { ...port }
    return Object.defineProperties(newPort, {
      comName: {
        get() {
          if (!warningSent) {
            warningSent = true
            console.warn(
              `"PortInfo.comName" has been deprecated. You should now use "PortInfo.path". The property will be removed in the next major release.`
            )
          }
          return newPort.path
        },
        enumerable: false,
      },
    })
  })
}

module.exports = {
  wrapWithHiddenComName,
}


/***/ }),

/***/ 1716:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const childProcess = __nccwpck_require__(3129)
const Readline = __nccwpck_require__(8697)

// get only serial port names
function checkPathOfDevice(path) {
  return /(tty(S|WCH|ACM|USB|AMA|MFD|O|XRUSB)|rfcomm)/.test(path) && path
}

function propName(name) {
  return {
    DEVNAME: 'path',
    ID_VENDOR_ENC: 'manufacturer',
    ID_SERIAL_SHORT: 'serialNumber',
    ID_VENDOR_ID: 'vendorId',
    ID_MODEL_ID: 'productId',
    DEVLINKS: 'pnpId',
  }[name.toUpperCase()]
}

function decodeHexEscape(str) {
  return str.replace(/\\x([a-fA-F0-9]{2})/g, (a, b) => {
    return String.fromCharCode(parseInt(b, 16))
  })
}

function propVal(name, val) {
  if (name === 'pnpId') {
    const match = val.match(/\/by-id\/([^\s]+)/)
    return (match && match[1]) || undefined
  }
  if (name === 'manufacturer') {
    return decodeHexEscape(val)
  }
  if (/^0x/.test(val)) {
    return val.substr(2)
  }
  return val
}

function listLinux() {
  return new Promise((resolve, reject) => {
    const ports = []
    const ude = childProcess.spawn('udevadm', ['info', '-e'])
    const lines = ude.stdout.pipe(new Readline())
    ude.on('close', code => code && reject(new Error(`Error listing ports udevadm exited with error code: ${code}`)))
    ude.on('error', reject)
    lines.on('error', reject)

    let port = {}
    let skipPort = false
    lines.on('data', line => {
      const lineType = line.slice(0, 1)
      const data = line.slice(3)
      // new port entry
      if (lineType === 'P') {
        port = {
          manufacturer: undefined,
          serialNumber: undefined,
          pnpId: undefined,
          locationId: undefined,
          vendorId: undefined,
          productId: undefined,
        }
        skipPort = false
        return
      }

      if (skipPort) {
        return
      }

      // Check dev name and save port if it matches flag to skip the rest of the data if not
      if (lineType === 'N') {
        if (checkPathOfDevice(data)) {
          ports.push(port)
        } else {
          skipPort = true
        }
        return
      }

      // parse data about each port
      if (lineType === 'E') {
        const keyValue = data.match(/^(.+)=(.*)/)
        if (!keyValue) {
          return
        }
        const key = propName(keyValue[1])
        if (!key) {
          return
        }
        port[key] = propVal(key, keyValue[2])
      }
    })

    lines.on('finish', () => resolve(ports))
  })
}

module.exports = listLinux


/***/ }),

/***/ 163:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { promisify } = __nccwpck_require__(1669)
const binding = require(__nccwpck_require__.ab + "build/Release/bindings.node")
const AbstractBinding = __nccwpck_require__(5892)
const linuxList = __nccwpck_require__(1716)
const Poller = __nccwpck_require__(628)
const unixRead = __nccwpck_require__(2822)
const unixWrite = __nccwpck_require__(1540)
const { wrapWithHiddenComName } = __nccwpck_require__(700)

const defaultBindingOptions = Object.freeze({
  vmin: 1,
  vtime: 0,
})

const asyncOpen = promisify(binding.open)
const asyncClose = promisify(binding.close)
const asyncUpdate = promisify(binding.update)
const asyncSet = promisify(binding.set)
const asyncGet = promisify(binding.get)
const asyncGetBaudRate = promisify(binding.getBaudRate)
const asyncDrain = promisify(binding.drain)
const asyncFlush = promisify(binding.flush)

/**
 * The linux binding layer
 */
class LinuxBinding extends AbstractBinding {
  static list() {
    return wrapWithHiddenComName(linuxList())
  }

  constructor(opt = {}) {
    super(opt)
    this.bindingOptions = { ...defaultBindingOptions, ...opt.bindingOptions }
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async open(path, options) {
    await super.open(path, options)
    this.openOptions = { ...this.bindingOptions, ...options }
    const fd = await asyncOpen(path, this.openOptions)
    this.fd = fd
    this.poller = new Poller(fd)
  }

  async close() {
    await super.close()
    const fd = this.fd
    this.poller.stop()
    this.poller.destroy()
    this.poller = null
    this.openOptions = null
    this.fd = null
    return asyncClose(fd)
  }

  async read(buffer, offset, length) {
    await super.read(buffer, offset, length)
    return unixRead({ binding: this, buffer, offset, length })
  }

  async write(buffer) {
    this.writeOperation = super.write(buffer).then(async () => {
      if (buffer.length === 0) {
        return
      }
      await unixWrite({ binding: this, buffer })
      this.writeOperation = null
    })
    return this.writeOperation
  }

  async update(options) {
    await super.update(options)
    return asyncUpdate(this.fd, options)
  }

  async set(options) {
    await super.set(options)
    return asyncSet(this.fd, options)
  }

  async get() {
    await super.get()
    return asyncGet(this.fd)
  }

  async getBaudRate() {
    await super.get()
    return asyncGetBaudRate(this.fd)
  }

  async drain() {
    await super.drain()
    await this.writeOperation
    return asyncDrain(this.fd)
  }

  async flush() {
    await super.flush()
    return asyncFlush(this.fd)
  }
}

module.exports = LinuxBinding


/***/ }),

/***/ 628:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const debug = __nccwpck_require__(8237)
const logger = debug('serialport/bindings/poller')
const EventEmitter = __nccwpck_require__(8614)
const PollerBindings = require(__nccwpck_require__.ab + "build/Release/bindings.node").Poller

const EVENTS = {
  UV_READABLE: 0b0001,
  UV_WRITABLE: 0b0010,
  UV_DISCONNECT: 0b0100,
}

function handleEvent(error, eventFlag) {
  if (error) {
    logger('error', error)
    this.emit('readable', error)
    this.emit('writable', error)
    this.emit('disconnect', error)
    return
  }
  if (eventFlag & EVENTS.UV_READABLE) {
    logger('received "readable"')
    this.emit('readable', null)
  }
  if (eventFlag & EVENTS.UV_WRITABLE) {
    logger('received "writable"')
    this.emit('writable', null)
  }
  if (eventFlag & EVENTS.UV_DISCONNECT) {
    logger('received "disconnect"')
    this.emit('disconnect', null)
  }
}

/**
 * Polls unix systems for readable or writable states of a file or serialport
 */
class Poller extends EventEmitter {
  constructor(fd, FDPoller = PollerBindings) {
    logger('Creating poller')
    super()
    this.poller = new FDPoller(fd, handleEvent.bind(this))
  }
  /**
   * Wait for the next event to occur
   * @param {string} event ('readable'|'writable'|'disconnect')
   * @returns {Poller} returns itself
   */
  once(event, callback) {
    switch (event) {
      case 'readable':
        this.poll(EVENTS.UV_READABLE)
        break
      case 'writable':
        this.poll(EVENTS.UV_WRITABLE)
        break
      case 'disconnect':
        this.poll(EVENTS.UV_DISCONNECT)
        break
    }
    return super.once(event, callback)
  }

  /**
   * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
   * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
   * @returns {undefined}
   */
  poll(eventFlag) {
    eventFlag = eventFlag || 0

    if (eventFlag & EVENTS.UV_READABLE) {
      logger('Polling for "readable"')
    }
    if (eventFlag & EVENTS.UV_WRITABLE) {
      logger('Polling for "writable"')
    }
    if (eventFlag & EVENTS.UV_DISCONNECT) {
      logger('Polling for "disconnect"')
    }

    this.poller.poll(eventFlag)
  }

  /**
   * Stop listening for events and cancel all outstanding listening with an error
   * @returns {undefined}
   */
  stop() {
    logger('Stopping poller')
    this.poller.stop()
    this.emitCanceled()
  }

  destroy() {
    logger('Destroying poller')
    this.poller.destroy()
    this.emitCanceled()
  }

  emitCanceled() {
    const err = new Error('Canceled')
    err.canceled = true
    this.emit('readable', err)
    this.emit('writable', err)
    this.emit('disconnect', err)
  }
}

Poller.EVENTS = EVENTS

module.exports = Poller


/***/ }),

/***/ 2822:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(5747)
const debug = __nccwpck_require__(8237)
const logger = debug('serialport/bindings/unixRead')
const { promisify } = __nccwpck_require__(1669)

const readAsync = promisify(fs.read)

const readable = binding => {
  return new Promise((resolve, reject) => {
    binding.poller.once('readable', err => (err ? reject(err) : resolve()))
  })
}

const unixRead = async ({ binding, buffer, offset, length, fsReadAsync = readAsync }) => {
  logger('Starting read')
  if (!binding.isOpen) {
    const err = new Error('Port is not open')
    err.canceled = true
    throw err
  }

  try {
    const { bytesRead } = await fsReadAsync(binding.fd, buffer, offset, length, null)
    if (bytesRead === 0) {
      return unixRead({ binding, buffer, offset, length, fsReadAsync })
    }
    logger('Finished read', bytesRead, 'bytes')
    return { bytesRead, buffer }
  } catch (err) {
    logger('read error', err)
    if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
      if (!binding.isOpen) {
        const err = new Error('Port is not open')
        err.canceled = true
        throw err
      }
      logger('waiting for readable because of code:', err.code)
      await readable(binding)
      return unixRead({ binding, buffer, offset, length, fsReadAsync })
    }

    const disconnectError =
      err.code === 'EBADF' || // Bad file number means we got closed
      err.code === 'ENXIO' || // No such device or address probably usb disconnect
      err.code === 'UNKNOWN' ||
      err.errno === -1 // generic error

    if (disconnectError) {
      err.disconnect = true
      logger('disconnecting', err)
    }

    throw err
  }
}

module.exports = unixRead


/***/ }),

/***/ 1540:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(5747)
const debug = __nccwpck_require__(8237)
const logger = debug('serialport/bindings/unixWrite')
const { promisify } = __nccwpck_require__(1669)

const writeAsync = promisify(fs.write)

const writable = binding => {
  return new Promise((resolve, reject) => {
    binding.poller.once('writable', err => (err ? reject(err) : resolve()))
  })
}

const unixWrite = async ({ binding, buffer, offset = 0, fsWriteAsync = writeAsync }) => {
  const bytesToWrite = buffer.length - offset
  logger('Starting write', buffer.length, 'bytes offset', offset, 'bytesToWrite', bytesToWrite)
  if (!binding.isOpen) {
    throw new Error('Port is not open')
  }
  try {
    const { bytesWritten } = await fsWriteAsync(binding.fd, buffer, offset, bytesToWrite)
    logger('write returned: wrote', bytesWritten, 'bytes')
    if (bytesWritten + offset < buffer.length) {
      if (!binding.isOpen) {
        throw new Error('Port is not open')
      }
      return unixWrite({ binding, buffer, offset: bytesWritten + offset, fsWriteAsync })
    }

    logger('Finished writing', bytesWritten + offset, 'bytes')
  } catch (err) {
    logger('write errored', err)
    if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
      if (!binding.isOpen) {
        throw new Error('Port is not open')
      }
      logger('waiting for writable because of code:', err.code)
      await writable(binding)
      return unixWrite({ binding, buffer, offset, fsWriteAsync })
    }

    const disconnectError =
      err.code === 'EBADF' || // Bad file number means we got closed
      err.code === 'ENXIO' || // No such device or address probably usb disconnect
      err.code === 'UNKNOWN' ||
      err.errno === -1 // generic error

    if (disconnectError) {
      err.disconnect = true
      logger('disconnecting', err)
    }

    logger('error', err)
    throw err
  }
}
module.exports = unixWrite


/***/ }),

/***/ 2898:
/***/ ((module) => {

const PARSERS = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/]

module.exports = pnpId => {
  if (!pnpId) {
    return null
  }
  for (const parser of PARSERS) {
    const sn = pnpId.match(parser)
    if (sn) {
      return sn[1]
    }
  }
  return null
}


/***/ }),

/***/ 1098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const binding = require(__nccwpck_require__.ab + "build/Release/bindings.node")
const AbstractBinding = __nccwpck_require__(5892)
const { promisify } = __nccwpck_require__(1669)
const serialNumParser = __nccwpck_require__(2898)

const asyncList = promisify(binding.list)
const asyncOpen = promisify(binding.open)
const asyncClose = promisify(binding.close)
const asyncRead = promisify(binding.read)
const asyncWrite = promisify(binding.write)
const asyncUpdate = promisify(binding.update)
const asyncSet = promisify(binding.set)
const asyncGet = promisify(binding.get)
const asyncGetBaudRate = promisify(binding.getBaudRate)
const asyncDrain = promisify(binding.drain)
const asyncFlush = promisify(binding.flush)
const { wrapWithHiddenComName } = __nccwpck_require__(700)

/**
 * The Windows binding layer
 */
class WindowsBinding extends AbstractBinding {
  static async list() {
    const ports = await asyncList()
    // Grab the serial number from the pnp id
    return wrapWithHiddenComName(
      ports.map(port => {
        if (port.pnpId && !port.serialNumber) {
          const serialNumber = serialNumParser(port.pnpId)
          if (serialNumber) {
            return {
              ...port,
              serialNumber,
            }
          }
        }
        return port
      })
    )
  }

  constructor(opt = {}) {
    super(opt)
    this.bindingOptions = { ...opt.bindingOptions }
    this.fd = null
    this.writeOperation = null
  }

  get isOpen() {
    return this.fd !== null
  }

  async open(path, options) {
    await super.open(path, options)
    this.openOptions = { ...this.bindingOptions, ...options }
    const fd = await asyncOpen(path, this.openOptions)
    this.fd = fd
  }

  async close() {
    await super.close()
    const fd = this.fd
    this.fd = null
    return asyncClose(fd)
  }

  async read(buffer, offset, length) {
    await super.read(buffer, offset, length)
    try {
      const bytesRead = await asyncRead(this.fd, buffer, offset, length)
      return { bytesRead, buffer }
    } catch (err) {
      if (!this.isOpen) {
        err.canceled = true
      }
      throw err
    }
  }

  async write(buffer) {
    this.writeOperation = super.write(buffer).then(async () => {
      if (buffer.length === 0) {
        return
      }
      await asyncWrite(this.fd, buffer)
      this.writeOperation = null
    })
    return this.writeOperation
  }

  async update(options) {
    await super.update(options)
    return asyncUpdate(this.fd, options)
  }

  async set(options) {
    await super.set(options)
    return asyncSet(this.fd, options)
  }

  async get() {
    await super.get()
    return asyncGet(this.fd)
  }

  async getBaudRate() {
    await super.get()
    return asyncGetBaudRate(this.fd)
  }

  async drain() {
    await super.drain()
    await this.writeOperation
    return asyncDrain(this.fd)
  }

  async flush() {
    await super.flush()
    return asyncFlush(this.fd)
  }
}

module.exports = WindowsBinding


/***/ }),

/***/ 4545:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * Emit data every number of bytes
 * @extends Transform
 * @param {Object} options parser options object
 * @param {Number} options.length the number of bytes on each data event
 * @summary A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new ByteLength({length: 8}))
parser.on('data', console.log) // will have 8 bytes per data event
 */
class ByteLengthParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (typeof options.length !== 'number') {
      throw new TypeError('"length" is not a number')
    }

    if (options.length < 1) {
      throw new TypeError('"length" is not greater than 0')
    }

    this.length = options.length
    this.position = 0
    this.buffer = Buffer.alloc(this.length)
  }

  _transform(chunk, encoding, cb) {
    let cursor = 0
    while (cursor < chunk.length) {
      this.buffer[this.position] = chunk[cursor]
      cursor++
      this.position++
      if (this.position === this.length) {
        this.push(this.buffer)
        this.buffer = Buffer.alloc(this.length)
        this.position = 0
      }
    }
    cb()
  }

  _flush(cb) {
    this.push(this.buffer.slice(0, this.position))
    this.buffer = Buffer.alloc(this.length)
    cb()
  }
}

module.exports = ByteLengthParser


/***/ }),

/***/ 7791:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * Parse the CCTalk protocol
 * @extends Transform
 * @summary A transform stream that emits CCTalk packets as they are received.
 * @example
const SerialPort = require('serialport')
const CCTalk = require('@serialport/parser-cctalk')
const port = new SerialPort('/dev/ttyUSB0')
const parser = port.pipe(new CCtalk())
parser.on('data', console.log)
 */
class CCTalkParser extends Transform {
  constructor(maxDelayBetweenBytesMs = 50) {
    super()
    this.array = []
    this.cursor = 0
    this.lastByteFetchTime = 0
    this.maxDelayBetweenBytesMs = maxDelayBetweenBytesMs
  }
  _transform(buffer, _, cb) {
    if (this.maxDelayBetweenBytesMs > 0) {
      const now = Date.now()
      if (now - this.lastByteFetchTime > this.maxDelayBetweenBytesMs) {
        this.array = []
        this.cursor = 0
      }
      this.lastByteFetchTime = now
    }

    this.cursor += buffer.length
    // TODO: Better Faster es7 no supported by node 4
    // ES7 allows directly push [...buffer]
    // this.array = this.array.concat(Array.from(buffer)) //Slower ?!?
    Array.from(buffer).map(byte => this.array.push(byte))
    while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
      // full frame accumulated
      // copy command from the array
      const FullMsgLength = this.array[1] + 5

      const frame = Buffer.from(this.array.slice(0, FullMsgLength))
      // Preserve Extra Data
      this.array = this.array.slice(frame.length, this.array.length)
      this.cursor -= FullMsgLength
      this.push(frame)
    }
    cb()
  }
}

module.exports = CCTalkParser


/***/ }),

/***/ 6487:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 * @summary To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 * @example
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
parser.on('data', console.log)
 */
class DelimiterParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    this.includeDelimiter = options.includeDelimiter !== undefined ? options.includeDelimiter : false
    this.delimiter = Buffer.from(options.delimiter)
    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk])
    let position
    while ((position = data.indexOf(this.delimiter)) !== -1) {
      this.push(data.slice(0, position + (this.includeDelimiter ? this.delimiter.length : 0)))
      data = data.slice(position + this.delimiter.length)
    }
    this.buffer = data
    cb()
  }

  _flush(cb) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}

module.exports = DelimiterParser


/***/ }),

/***/ 4026:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * Emits data if there is a pause between packets for the specified amount of time.
 * @extends Transform
 * @param {Object} options parser options object
 * @param {Number} options.interval the period of silence in milliseconds after which data is emited
 * @param {Number} options.maxBufferSize the maximum number of bytes after which data will be emited. Defaults to 65536.
 * @summary A transform stream that emits data as a buffer after not receiving any bytes for the specified amount of time.
 * @example
const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new InterByteTimeout({interval: 30}))
parser.on('data', console.log) // will emit data if there is a pause between packets greater than 30ms
 */

class InterByteTimeoutParser extends Transform {
  constructor(options) {
    super()
    options = { maxBufferSize: 65536, ...options }
    if (!options.interval) {
      throw new TypeError('"interval" is required')
    }

    if (typeof options.interval !== 'number' || Number.isNaN(options.interval)) {
      throw new TypeError('"interval" is not a number')
    }

    if (options.interval < 1) {
      throw new TypeError('"interval" is not greater than 0')
    }

    if (typeof options.maxBufferSize !== 'number' || Number.isNaN(options.maxBufferSize)) {
      throw new TypeError('"maxBufferSize" is not a number')
    }

    if (options.maxBufferSize < 1) {
      throw new TypeError('"maxBufferSize" is not greater than 0')
    }

    this.maxBufferSize = options.maxBufferSize
    this.currentPacket = []
    this.interval = options.interval
    this.intervalID = -1
  }
  _transform(chunk, encoding, cb) {
    clearTimeout(this.intervalID)
    for (let offset = 0; offset < chunk.length; offset++) {
      this.currentPacket.push(chunk[offset])
      if (this.currentPacket.length >= this.maxBufferSize) {
        this.emitPacket()
      }
    }
    this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval)
    cb()
  }
  emitPacket() {
    clearTimeout(this.intervalID)
    if (this.currentPacket.length > 0) {
      this.push(Buffer.from(this.currentPacket))
    }
    this.currentPacket = []
  }
  _flush(cb) {
    this.emitPacket()
    cb()
  }
}

module.exports = InterByteTimeoutParser


/***/ }),

/***/ 8697:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const DelimiterParser = __nccwpck_require__(6487)

/**
 *  A transform stream that emits data after a newline delimiter is received.
 * @summary To use the `Readline` parser, provide a delimiter (defaults to `\n`). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 * @extends DelimiterParser
 * @example
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', console.log)
*/
class ReadLineParser extends DelimiterParser {
  constructor(options) {
    const opts = {
      delimiter: Buffer.from('\n', 'utf8'),
      encoding: 'utf8',
      ...options,
    }

    if (typeof opts.delimiter === 'string') {
      opts.delimiter = Buffer.from(opts.delimiter, opts.encoding)
    }

    super(opts)
  }
}

module.exports = ReadLineParser


/***/ }),

/***/ 2928:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * A transform stream that waits for a sequence of "ready" bytes before emitting a ready event and emitting data events
 * @summary To use the `Ready` parser provide a byte start sequence. After the bytes have been received a ready event is fired and data events are passed through.
 * @extends Transform
 * @example
const SerialPort = require('serialport')
const Ready = require('@serialport/parser-ready')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Ready({ delimiter: 'READY' }))
parser.on('ready', () => console.log('the ready byte sequence has been received'))
parser.on('data', console.log) // all data after READY is received
 */
class ReadyParser extends Transform {
  /**
   *
   * @param {object} options options for the parser
   * @param {string|Buffer|array} options.delimiter data to look for before emitted "ready"
   */
  constructor(options = {}) {
    if (options.delimiter === undefined) {
      throw new TypeError('"delimiter" is not a bufferable object')
    }

    if (options.delimiter.length === 0) {
      throw new TypeError('"delimiter" has a 0 or undefined length')
    }

    super(options)
    this.delimiter = Buffer.from(options.delimiter)
    this.readOffset = 0
    this.ready = false
  }

  _transform(chunk, encoding, cb) {
    if (this.ready) {
      this.push(chunk)
      return cb()
    }
    const delimiter = this.delimiter
    let chunkOffset = 0
    while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
      if (delimiter[this.readOffset] === chunk[chunkOffset]) {
        this.readOffset++
      } else {
        this.readOffset = 0
      }
      chunkOffset++
    }
    if (this.readOffset === delimiter.length) {
      this.ready = true
      this.emit('ready')
      const chunkRest = chunk.slice(chunkOffset)
      if (chunkRest.length > 0) {
        this.push(chunkRest)
      }
    }
    cb()
  }
}

module.exports = ReadyParser


/***/ }),

/***/ 6439:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Transform } = __nccwpck_require__(2413)

/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 * @extends Transform
 * @example
const SerialPort = require('serialport')
const Regex = require('@serialport/parser-regex')
const port = new SerialPort('/dev/tty-usbserial1')
const parser = port.pipe(new Regex({ regex: /[\r\n]+/ }))
parser.on('data', console.log)
 */
class RegexParser extends Transform {
  constructor(options) {
    const opts = {
      encoding: 'utf8',
      ...options,
    }

    if (opts.regex === undefined) {
      throw new TypeError('"options.regex" must be a regular expression pattern or object')
    }

    if (!(opts.regex instanceof RegExp)) {
      opts.regex = new RegExp(opts.regex)
    }
    super(opts)

    this.regex = opts.regex
    this.data = ''
  }

  _transform(chunk, encoding, cb) {
    const data = this.data + chunk
    const parts = data.split(this.regex)
    this.data = parts.pop()

    parts.forEach(part => {
      this.push(part)
    })
    cb()
  }

  _flush(cb) {
    this.push(this.data)
    this.data = ''
    cb()
  }
}

module.exports = RegexParser


/***/ }),

/***/ 978:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const stream = __nccwpck_require__(2413)
const util = __nccwpck_require__(1669)
const debug = __nccwpck_require__(8237)('serialport/stream')

//  VALIDATION
const DATABITS = Object.freeze([5, 6, 7, 8])
const STOPBITS = Object.freeze([1, 1.5, 2])
const PARITY = Object.freeze(['none', 'even', 'mark', 'odd', 'space'])
const FLOWCONTROLS = Object.freeze(['xon', 'xoff', 'xany', 'rtscts'])

const defaultSettings = Object.freeze({
  autoOpen: true,
  endOnClose: false,
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
  highWaterMark: 64 * 1024,
})

const defaultSetFlags = Object.freeze({
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true,
})

function allocNewReadPool(poolSize) {
  const pool = Buffer.allocUnsafe(poolSize)
  pool.used = 0
  return pool
}

/**
 * A callback called with an error or null.
 * @typedef {function} errorCallback
 * @param {?error} error
 */

/**
 * A callback called with an error or an object with the modem line values (cts, dsr, dcd).
 * @typedef {function} modemBitsCallback
 * @param {?error} error
 * @param {?object} status
 * @param {boolean} [status.cts=false]
 * @param {boolean} [status.dsr=false]
 * @param {boolean} [status.dcd=false]
 */

/**
 * @typedef {Object} openOptions
 * @property {boolean} [autoOpen=true] Automatically opens the port on `nextTick`.
 * @property {number=} [baudRate=9600] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
 * @property {number} [dataBits=8] Must be one of these: 8, 7, 6, or 5.
 * @property {number} [highWaterMark=65536] The size of the read and write buffers defaults to 64k.
 * @property {boolean} [lock=true] Prevent other processes from opening the port. Windows does not currently support `false`.
 * @property {number} [stopBits=1] Must be one of these: 1 or 2.
 * @property {string} [parity=none] Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.
 * @property {boolean} [rtscts=false] flow control setting
 * @property {boolean} [xon=false] flow control setting
 * @property {boolean} [xoff=false] flow control setting
 * @property {boolean} [xany=false] flow control setting
 * @property {object=} bindingOptions sets binding-specific options
 * @property {Binding=} binding The hardware access binding. `Bindings` are how Node-Serialport talks to the underlying system. By default we auto detect Windows (`WindowsBinding`), Linux (`LinuxBinding`) and OS X (`DarwinBinding`) and load the appropriate module for your system.
 * @property {number} [bindingOptions.vmin=1] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 * @property {number} [bindingOptions.vtime=0] see [`man termios`](http://linux.die.net/man/3/termios) LinuxBinding and DarwinBinding
 */

/**
 * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.
 * @class SerialPort
 * @param {string} path - The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows.
 * @param {openOptions=} options - Port configuration options
 * @param {errorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event. The callback will NOT be called if `autoOpen` is set to `false` in the `openOptions` as the open will not be performed.
 * @property {number} baudRate The port's baudRate. Use `.update` to change it. Read-only.
 * @property {object} binding The binding object backing the port. Read-only.
 * @property {boolean} isOpen `true` if the port is open, `false` otherwise. Read-only. (`since 5.0.0`)
 * @property {string} path The system path or name of the serial port. Read-only.
 * @throws {TypeError} When given invalid arguments, a `TypeError` will be thrown.
 * @emits open
 * @emits data
 * @emits close
 * @emits error
 * @alias module:serialport
 */
function SerialPort(path, options, openCallback) {
  if (!(this instanceof SerialPort)) {
    return new SerialPort(path, options, openCallback)
  }

  if (options instanceof Function) {
    openCallback = options
    options = {}
  }

  const settings = { ...defaultSettings, ...options }

  stream.Duplex.call(this, {
    highWaterMark: settings.highWaterMark,
  })

  const Binding = settings.binding || SerialPort.Binding

  if (!Binding) {
    throw new TypeError('"Bindings" is invalid pass it as `options.binding` or set it on `SerialPort.Binding`')
  }

  if (!path) {
    throw new TypeError(`"path" is not defined: ${path}`)
  }

  if (settings.baudrate) {
    throw new TypeError(`"baudrate" is an unknown option, did you mean "baudRate"?`)
  }

  if (typeof settings.baudRate !== 'number') {
    throw new TypeError(`"baudRate" must be a number: ${settings.baudRate}`)
  }

  if (DATABITS.indexOf(settings.dataBits) === -1) {
    throw new TypeError(`"databits" is invalid: ${settings.dataBits}`)
  }

  if (STOPBITS.indexOf(settings.stopBits) === -1) {
    throw new TypeError(`"stopbits" is invalid: ${settings.stopbits}`)
  }

  if (PARITY.indexOf(settings.parity) === -1) {
    throw new TypeError(`"parity" is invalid: ${settings.parity}`)
  }

  FLOWCONTROLS.forEach(control => {
    if (typeof settings[control] !== 'boolean') {
      throw new TypeError(`"${control}" is not boolean: ${settings[control]}`)
    }
  })

  const binding = new Binding({
    bindingOptions: settings.bindingOptions,
  })

  Object.defineProperties(this, {
    binding: {
      enumerable: true,
      value: binding,
    },
    path: {
      enumerable: true,
      value: path,
    },
    settings: {
      enumerable: true,
      value: settings,
    },
  })

  this.opening = false
  this.closing = false
  this._pool = allocNewReadPool(this.settings.highWaterMark)
  this._kMinPoolSpace = 128

  if (this.settings.autoOpen) {
    this.open(openCallback)
  }
}

util.inherits(SerialPort, stream.Duplex)

Object.defineProperties(SerialPort.prototype, {
  isOpen: {
    enumerable: true,
    get() {
      return this.binding.isOpen && !this.closing
    },
  },
  baudRate: {
    enumerable: true,
    get() {
      return this.settings.baudRate
    },
  },
})

/**
 * The `error` event's callback is called with an error object whenever there is an error.
 * @event error
 */

SerialPort.prototype._error = function (error, callback) {
  if (callback) {
    callback.call(this, error)
  } else {
    this.emit('error', error)
  }
}

SerialPort.prototype._asyncError = function (error, callback) {
  process.nextTick(() => this._error(error, callback))
}

/**
 * The `open` event's callback is called with no arguments when the port is opened and ready for writing. This happens if you have the constructor open immediately (which opens in the next tick) or if you open the port manually with `open()`. See [Useage/Opening a Port](#opening-a-port) for more information.
 * @event open
 */

/**
 * Opens a connection to the given serial port.
 * @param {errorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event.
 * @emits open
 * @returns {undefined}
 */
SerialPort.prototype.open = function (openCallback) {
  if (this.isOpen) {
    return this._asyncError(new Error('Port is already open'), openCallback)
  }

  if (this.opening) {
    return this._asyncError(new Error('Port is opening'), openCallback)
  }

  this.opening = true
  debug('opening', `path: ${this.path}`)
  this.binding.open(this.path, this.settings).then(
    () => {
      debug('opened', `path: ${this.path}`)
      this.opening = false
      this.emit('open')
      if (openCallback) {
        openCallback.call(this, null)
      }
    },
    err => {
      this.opening = false
      debug('Binding #open had an error', err)
      this._error(err, openCallback)
    }
  )
}

/**
 * Changes the baud rate for an open port. Throws if you provide a bad argument. Emits an error or calls the callback if the baud rate isn't supported.
 * @param {object=} options Only supports `baudRate`.
 * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
 * @param {errorCallback=} [callback] Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.
 * @returns {undefined}
 */
SerialPort.prototype.update = function (options, callback) {
  if (typeof options !== 'object') {
    throw TypeError('"options" is not an object')
  }

  if (!this.isOpen) {
    debug('update attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  const settings = { ...defaultSettings, ...options }
  this.settings.baudRate = settings.baudRate

  debug('update', `baudRate: ${settings.baudRate}`)
  this.binding.update(this.settings).then(
    () => {
      debug('binding.update', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.update', 'error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Writes data to the given serial port. Buffers written data if the port is not open.

The write operation is non-blocking. When it returns, data might still not have been written to the serial port. See `drain()`.

Some devices, like the Arduino, reset when you open a connection to them. In such cases, immediately writing to the device will cause lost data as they wont be ready to receive the data. This is often worked around by having the Arduino send a "ready" byte that your Node program waits for before writing. You can also often get away with waiting around 400ms.

If a port is disconnected during a write, the write will error in addition to the `close` event.

From the [stream docs](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback) write errors don't always provide the error in the callback, sometimes they use the error event.
> If an error occurs, the callback may or may not be called with the error as its first argument. To reliably detect write errors, add a listener for the 'error' event.

In addition to the usual `stream.write` arguments (`String` and `Buffer`), `write()` can accept arrays of bytes (positive numbers under 256) which is passed to `Buffer.from([])` for conversion. This extra functionality is pretty sweet.
 * @method SerialPort.prototype.write
 * @param  {(string|array|buffer)} data Accepts a [`Buffer`](http://nodejs.org/api/buffer.html) object, or a type that is accepted by the `Buffer` constructor (e.g. an array of bytes or a string).
 * @param  {string=} encoding The encoding, if chunk is a string. Defaults to `'utf8'`. Also accepts `'ascii'`, `'base64'`, `'binary'`, and `'hex'` See [Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) for all available options.
 * @param  {function=} callback Called once the write operation finishes. Data may not yet be flushed to the underlying port. No arguments.
 * @returns {boolean} `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.
 * @since 5.0.0
 */
const superWrite = SerialPort.prototype.write
SerialPort.prototype.write = function (data, encoding, callback) {
  if (Array.isArray(data)) {
    data = Buffer.from(data)
  }
  return superWrite.call(this, data, encoding, callback)
}

SerialPort.prototype._write = function (data, encoding, callback) {
  if (!this.isOpen) {
    return this.once('open', function afterOpenWrite() {
      this._write(data, encoding, callback)
    })
  }
  debug('_write', `${data.length} bytes of data`)
  this.binding.write(data).then(
    () => {
      debug('binding.write', 'write finished')
      callback(null)
    },
    err => {
      debug('binding.write', 'error', err)
      if (!err.canceled) {
        this._disconnected(err)
      }
      callback(err)
    }
  )
}

SerialPort.prototype._writev = function (data, callback) {
  debug('_writev', `${data.length} chunks of data`)
  const dataV = data.map(write => write.chunk)
  this._write(Buffer.concat(dataV), null, callback)
}

/**
 * Request a number of bytes from the SerialPort. The `read()` method pulls some data out of the internal buffer and returns it. If no data is available to be read, null is returned. By default, the data is returned as a `Buffer` object unless an encoding has been specified using the `.setEncoding()` method.
 * @method SerialPort.prototype.read
 * @param {number=} size Specify how many bytes of data to return, if available
 * @returns {(string|Buffer|null)} The data from internal buffers
 * @since 5.0.0
 */

/**
 * Listening for the `data` event puts the port in flowing mode. Data is emitted as soon as it's received. Data is a `Buffer` object with a varying amount of data in it. The `readLine` parser converts the data into string lines. See the [parsers](https://serialport.io/docs/api-parsers-overview) section for more information on parsers, and the [Node.js stream documentation](https://nodejs.org/api/stream.html#stream_event_data) for more information on the data event.
 * @event data
 */

SerialPort.prototype._read = function (bytesToRead) {
  if (!this.isOpen) {
    debug('_read', 'queueing _read for after open')
    this.once('open', () => {
      this._read(bytesToRead)
    })
    return
  }

  if (!this._pool || this._pool.length - this._pool.used < this._kMinPoolSpace) {
    debug('_read', 'discarding the read buffer pool because it is below kMinPoolSpace')
    this._pool = allocNewReadPool(this.settings.highWaterMark)
  }

  // Grab another reference to the pool in the case that while we're
  // in the thread pool another read() finishes up the pool, and
  // allocates a new one.
  const pool = this._pool
  // Read the smaller of rest of the pool or however many bytes we want
  const toRead = Math.min(pool.length - pool.used, bytesToRead)
  const start = pool.used

  // the actual read.
  debug('_read', `reading`, { start, toRead })
  this.binding.read(pool, start, toRead).then(
    ({ bytesRead }) => {
      debug('binding.read', `finished`, { bytesRead })
      // zero bytes means read means we've hit EOF? Maybe this should be an error
      if (bytesRead === 0) {
        debug('binding.read', 'Zero bytes read closing readable stream')
        this.push(null)
        return
      }
      pool.used += bytesRead
      this.push(pool.slice(start, start + bytesRead))
    },
    err => {
      debug('binding.read', `error`, err)
      if (!err.canceled) {
        this._disconnected(err)
      }
      this._read(bytesToRead) // prime to read more once we're reconnected
    }
  )
}

SerialPort.prototype._disconnected = function (err) {
  if (!this.isOpen) {
    debug('disconnected aborted because already closed', err)
    return
  }
  debug('disconnected', err)
  err.disconnected = true
  this.close(null, err)
}

/**
 * The `close` event's callback is called with no arguments when the port is closed. In the case of a disconnect it will be called with a Disconnect Error object (`err.disconnected == true`). In the event of a close error (unlikely), an error event is triggered.
 * @event close
 */

/**
 * Closes an open connection.
 *
 * If there are in progress writes when the port is closed the writes will error.
 * @param {errorCallback} callback Called once a connection is closed.
 * @param {Error} disconnectError used internally to propagate a disconnect error
 * @emits close
 * @returns {undefined}
 */
SerialPort.prototype.close = function (callback, disconnectError) {
  disconnectError = disconnectError || null

  if (!this.isOpen) {
    debug('close attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  this.closing = true
  debug('#close')
  this.binding.close().then(
    () => {
      this.closing = false
      debug('binding.close', 'finished')
      this.emit('close', disconnectError)
      if (this.settings.endOnClose) {
        this.emit('end')
      }
      if (callback) {
        callback.call(this, disconnectError)
      }
    },
    err => {
      this.closing = false
      debug('binding.close', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.
 * @param {object=} options All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
 * @param {Boolean} [options.brk=false] sets the brk flag
 * @param {Boolean} [options.cts=false] sets the cts flag
 * @param {Boolean} [options.dsr=false] sets the dsr flag
 * @param {Boolean} [options.dtr=true] sets the dtr flag
 * @param {Boolean} [options.rts=true] sets the rts flag
 * @param {errorCallback=} callback Called once the port's flags have been set.
 * @since 5.0.0
 * @returns {undefined}
 */
SerialPort.prototype.set = function (options, callback) {
  if (typeof options !== 'object') {
    throw TypeError('"options" is not an object')
  }

  if (!this.isOpen) {
    debug('set attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  const settings = { ...defaultSetFlags, ...options }
  debug('#set', settings)
  this.binding.set(settings).then(
    () => {
      debug('binding.set', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.set', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Returns the control flags (CTS, DSR, DCD) on the open port.
 * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
 * @param {modemBitsCallback=} callback Called once the modem bits are retrieved.
 * @returns {undefined}
 */
SerialPort.prototype.get = function (callback) {
  if (!this.isOpen) {
    debug('get attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  debug('#get')
  this.binding.get().then(
    status => {
      debug('binding.get', 'finished')
      if (callback) {
        callback.call(this, null, status)
      }
    },
    err => {
      debug('binding.get', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
 * @param  {errorCallback=} callback Called once the flush operation finishes.
 * @returns {undefined}
 */
SerialPort.prototype.flush = function (callback) {
  if (!this.isOpen) {
    debug('flush attempted, but port is not open')
    return this._asyncError(new Error('Port is not open'), callback)
  }

  debug('#flush')
  this.binding.flush().then(
    () => {
      debug('binding.flush', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.flush', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.
 * @param {errorCallback=} callback Called once the drain operation returns.
 * @returns {undefined}
 * @example
Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.

```js
function writeAndDrain (data, callback) {
  port.write(data);
  port.drain(callback);
}
```
 */
SerialPort.prototype.drain = function (callback) {
  debug('drain')
  if (!this.isOpen) {
    debug('drain queuing on port open')
    return this.once('open', () => {
      this.drain(callback)
    })
  }
  this.binding.drain().then(
    () => {
      debug('binding.drain', 'finished')
      if (callback) {
        callback.call(this, null)
      }
    },
    err => {
      debug('binding.drain', 'had an error', err)
      return this._error(err, callback)
    }
  )
}

/**
 * The `pause()` method causes a stream in flowing mode to stop emitting 'data' events, switching out of flowing mode. Any data that becomes available remains in the internal buffer.
 * @method SerialPort.prototype.pause
 * @see resume
 * @since 5.0.0
 * @returns `this`
 */

/**
 * The `resume()` method causes an explicitly paused, `Readable` stream to resume emitting 'data' events, switching the stream into flowing mode.
 * @method SerialPort.prototype.resume
 * @see pause
 * @since 5.0.0
 * @returns `this`
 */

/**
 * Retrieves a list of available serial ports with metadata. Only the `path` is guaranteed. If unavailable the other fields will be undefined. The `path` is either the path or an identifier (eg `COM1`) used to open the SerialPort.
 *
 * We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.
 * @type {function}
 * @returns {Promise} Resolves with the list of available serial ports.
 * @example
```js
// OSX example port
{
  path: '/dev/tty.usbmodem1421',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: undefined,
  locationId: '14500000',
  productId: '0043',
  vendorId: '2341'
}

// Linux example port
{
  path: '/dev/ttyACM0',
  manufacturer: 'Arduino (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
  locationId: undefined,
  productId: '0043',
  vendorId: '2341'
}

// Windows example port
{
  path: 'COM3',
  manufacturer: 'Arduino LLC (www.arduino.cc)',
  serialNumber: '752303138333518011C1',
  pnpId: 'USB\\VID_2341&PID_0043\\752303138333518011C1',
  locationId: 'Port_#0003.Hub_#0001',
  productId: '0043',
  vendorId: '2341'
}
```

```js
var SerialPort = require('serialport');

// promise approach
SerialPort.list()
  .then(ports) {...});
  .catch(err) {...});
```
 */
SerialPort.list = async function (callback) {
  debug('.list')
  if (!SerialPort.Binding) {
    throw new TypeError('No Binding set on `SerialPort.Binding`')
  }
  if (callback) {
    throw new TypeError('SerialPort.list no longer takes a callback and only returns a promise')
  }
  return SerialPort.Binding.list()
}

module.exports = SerialPort


/***/ }),

/***/ 6734:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* module decorator */ module = __nccwpck_require__.nmd(module);


const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert === undefined) {
		colorConvert = __nccwpck_require__(5121);
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});


/***/ }),

/***/ 8159:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = __nccwpck_require__(4057);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 5121:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(8159);
const route = __nccwpck_require__(4663);

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 4663:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const conversions = __nccwpck_require__(8159);

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 4057:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 1538:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 4955:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const os = __nccwpck_require__(2087);
const tty = __nccwpck_require__(3867);
const hasFlag = __nccwpck_require__(1538);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 8818:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const ansiStyles = __nccwpck_require__(6734);
const {stdout: stdoutColor, stderr: stderrColor} = __nccwpck_require__(4955);
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = __nccwpck_require__(2415);

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = __nccwpck_require__(500);
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

module.exports = chalk;


/***/ }),

/***/ 500:
/***/ ((module) => {

"use strict";

const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) {
			results.push(number);
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) {
			continue;
		}

		if (!(styleName in current)) {
			throw new Error(`Unknown Chalk style: ${styleName}`);
		}

		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}

	return current;
}

module.exports = (chalk, temporary) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMessage);
	}

	return chunks.join('');
};


/***/ }),

/***/ 2415:
/***/ ((module) => {

"use strict";


const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

module.exports = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};


/***/ }),

/***/ 8222:
/***/ ((module, exports, __nccwpck_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __nccwpck_require__(6243)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 6243:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __nccwpck_require__(900);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 8237:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __nccwpck_require__(8222);
} else {
	module.exports = __nccwpck_require__(5332);
}


/***/ }),

/***/ 5332:
/***/ ((module, exports, __nccwpck_require__) => {

/**
 * Module dependencies.
 */

const tty = __nccwpck_require__(3867);
const util = __nccwpck_require__(1669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __nccwpck_require__(9318);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __nccwpck_require__(6243)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 1621:
/***/ ((module) => {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),

/***/ 900:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 5998:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SerialPort = __nccwpck_require__(978)
const Binding = __nccwpck_require__(2981)
const parsers = __nccwpck_require__(3001)

/**
 * @type {AbstractBinding}
 */
SerialPort.Binding = Binding

/**
 * @type {Parsers}
 */
SerialPort.parsers = parsers

module.exports = SerialPort


/***/ }),

/***/ 3001:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  ByteLength: __nccwpck_require__(4545),
  CCTalk: __nccwpck_require__(7791),
  Delimiter: __nccwpck_require__(6487),
  InterByteTimeout: __nccwpck_require__(4026),
  Readline: __nccwpck_require__(8697),
  Ready: __nccwpck_require__(2928),
  Regex: __nccwpck_require__(6439),
}


/***/ }),

/***/ 7029:
/***/ ((__unused_webpack_module, exports) => {

exports.quote = function (xs) {
    return xs.map(function (s) {
        if (s && typeof s === 'object') {
            return s.op.replace(/(.)/g, '\\$1');
        }
        else if (/["\s]/.test(s) && !/'/.test(s)) {
            return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        }
        else if (/["'\s]/.test(s)) {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
        }
        else {
            return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
        }
    }).join(' ');
};

// '<(' is process substitution operator and
// can be parsed the same as control operator
var CONTROL = '(?:' + [
    '\\|\\|', '\\&\\&', ';;', '\\|\\&', '\\<\\(', '>>', '>\\&', '[&;()|<>]'
].join('|') + ')';
var META = '|&;()<> \\t';
var BAREWORD = '(\\\\[\'"' + META + ']|[^\\s\'"' + META + '])+';
var SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
var DOUBLE_QUOTE = '\'((\\\\\'|[^\'])*?)\'';

var TOKEN = '';
for (var i = 0; i < 4; i++) {
    TOKEN += (Math.pow(16,8)*Math.random()).toString(16);
}

exports.parse = function (s, env, opts) {
    var mapped = parse(s, env, opts);
    if (typeof env !== 'function') return mapped;
    return mapped.reduce(function (acc, s) {
        if (typeof s === 'object') return acc.concat(s);
        var xs = s.split(RegExp('(' + TOKEN + '.*?' + TOKEN + ')', 'g'));
        if (xs.length === 1) return acc.concat(xs[0]);
        return acc.concat(xs.filter(Boolean).map(function (x) {
            if (RegExp('^' + TOKEN).test(x)) {
                return JSON.parse(x.split(TOKEN)[1]);
            }
            else return x;
        }));
    }, []);
};

function parse (s, env, opts) {
    var chunker = new RegExp([
        '(' + CONTROL + ')', // control chars
        '(' + BAREWORD + '|' + SINGLE_QUOTE + '|' + DOUBLE_QUOTE + ')*'
    ].join('|'), 'g');
    var match = s.match(chunker).filter(Boolean);
    var commented = false;

    if (!match) return [];
    if (!env) env = {};
    if (!opts) opts = {};
    return match.map(function (s, j) {
        if (commented) {
            return;
        }
        if (RegExp('^' + CONTROL + '$').test(s)) {
            return { op: s };
        }

        // Hand-written scanner/parser for Bash quoting rules:
        //
        //  1. inside single quotes, all characters are printed literally.
        //  2. inside double quotes, all characters are printed literally
        //     except variables prefixed by '$' and backslashes followed by
        //     either a double quote or another backslash.
        //  3. outside of any quotes, backslashes are treated as escape
        //     characters and not printed (unless they are themselves escaped)
        //  4. quote context can switch mid-token if there is no whitespace
        //     between the two quote contexts (e.g. all'one'"token" parses as
        //     "allonetoken")
        var SQ = "'";
        var DQ = '"';
        var DS = '$';
        var BS = opts.escape || '\\';
        var quote = false;
        var esc = false;
        var out = '';
        var isGlob = false;

        for (var i = 0, len = s.length; i < len; i++) {
            var c = s.charAt(i);
            isGlob = isGlob || (!quote && (c === '*' || c === '?'));
            if (esc) {
                out += c;
                esc = false;
            }
            else if (quote) {
                if (c === quote) {
                    quote = false;
                }
                else if (quote == SQ) {
                    out += c;
                }
                else { // Double quote
                    if (c === BS) {
                        i += 1;
                        c = s.charAt(i);
                        if (c === DQ || c === BS || c === DS) {
                            out += c;
                        } else {
                            out += BS + c;
                        }
                    }
                    else if (c === DS) {
                        out += parseEnvVar();
                    }
                    else {
                        out += c;
                    }
                }
            }
            else if (c === DQ || c === SQ) {
                quote = c;
            }
            else if (RegExp('^' + CONTROL + '$').test(c)) {
                return { op: s };
            }
            else if (RegExp('^#$').test(c)) {
                commented = true;
                if (out.length){
                    return [out, { comment: s.slice(i+1) + match.slice(j+1).join(' ') }];
                }
                return [{ comment: s.slice(i+1) + match.slice(j+1).join(' ') }];
            }
            else if (c === BS) {
                esc = true;
            }
            else if (c === DS) {
                out += parseEnvVar();
            }
            else out += c;
        }

        if (isGlob) return {op: 'glob', pattern: out};

        return out;

        function parseEnvVar() {
            i += 1;
            var varend, varname;
            //debugger
            if (s.charAt(i) === '{') {
                i += 1;
                if (s.charAt(i) === '}') {
                    throw new Error("Bad substitution: " + s.substr(i - 2, 3));
                }
                varend = s.indexOf('}', i);
                if (varend < 0) {
                    throw new Error("Bad substitution: " + s.substr(i));
                }
                varname = s.substr(i, varend - i);
                i = varend;
            }
            else if (/[*@#?$!_\-]/.test(s.charAt(i))) {
                varname = s.charAt(i);
                i += 1;
            }
            else {
                varend = s.substr(i).match(/[^\w\d_]/);
                if (!varend) {
                    varname = s.substr(i);
                    i = s.length;
                } else {
                    varname = s.substr(i, varend.index);
                    i += varend.index - 1;
                }
            }
            return getVar(null, '', varname);
        }
    })
    // finalize parsed aruments
    .reduce(function(prev, arg){
        if (arg === undefined){
            return prev;
        }
        return prev.concat(arg);
    },[]);

    function getVar (_, pre, key) {
        var r = typeof env === 'function' ? env(key) : env[key];
        if (r === undefined && key != '')
            r = '';
        else if (r === undefined)
            r = '$';

        if (typeof r === 'object') {
            return pre + TOKEN + JSON.stringify(r) + TOKEN;
        }
        else return pre + r;
    }
}


/***/ }),

/***/ 9318:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const os = __nccwpck_require__(2087);
const hasFlag = __nccwpck_require__(1621);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),

/***/ 5840:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "v1", ({
  enumerable: true,
  get: function () {
    return _v.default;
  }
}));
Object.defineProperty(exports, "v3", ({
  enumerable: true,
  get: function () {
    return _v2.default;
  }
}));
Object.defineProperty(exports, "v4", ({
  enumerable: true,
  get: function () {
    return _v3.default;
  }
}));
Object.defineProperty(exports, "v5", ({
  enumerable: true,
  get: function () {
    return _v4.default;
  }
}));
Object.defineProperty(exports, "NIL", ({
  enumerable: true,
  get: function () {
    return _nil.default;
  }
}));
Object.defineProperty(exports, "version", ({
  enumerable: true,
  get: function () {
    return _version.default;
  }
}));
Object.defineProperty(exports, "validate", ({
  enumerable: true,
  get: function () {
    return _validate.default;
  }
}));
Object.defineProperty(exports, "stringify", ({
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
}));
Object.defineProperty(exports, "parse", ({
  enumerable: true,
  get: function () {
    return _parse.default;
  }
}));

var _v = _interopRequireDefault(__nccwpck_require__(8628));

var _v2 = _interopRequireDefault(__nccwpck_require__(6409));

var _v3 = _interopRequireDefault(__nccwpck_require__(5122));

var _v4 = _interopRequireDefault(__nccwpck_require__(9120));

var _nil = _interopRequireDefault(__nccwpck_require__(5350));

var _version = _interopRequireDefault(__nccwpck_require__(1595));

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 4569:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6417));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('md5').update(bytes).digest();
}

var _default = md5;
exports.default = _default;

/***/ }),

/***/ 5350:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports.default = _default;

/***/ }),

/***/ 2746:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports.default = _default;

/***/ }),

/***/ 814:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports.default = _default;

/***/ }),

/***/ 807:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = rng;

var _crypto = _interopRequireDefault(__nccwpck_require__(6417));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto.default.randomFillSync(rnds8Pool);

    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ 5274:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6417));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('sha1').update(bytes).digest();
}

var _default = sha1;
exports.default = _default;

/***/ }),

/***/ 8950:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports.default = _default;

/***/ }),

/***/ 8628:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports.default = _default;

/***/ }),

/***/ 6409:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5198));

var _md = _interopRequireDefault(__nccwpck_require__(4569));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports.default = _default;

/***/ }),

/***/ 5198:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

var _parse = _interopRequireDefault(__nccwpck_require__(2746));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ 5122:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(807));

var _stringify = _interopRequireDefault(__nccwpck_require__(8950));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports.default = _default;

/***/ }),

/***/ 9120:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(5198));

var _sha = _interopRequireDefault(__nccwpck_require__(5274));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports.default = _default;

/***/ }),

/***/ 6900:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _regex = _interopRequireDefault(__nccwpck_require__(814));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports.default = _default;

/***/ }),

/***/ 1595:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(6900));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports.default = _default;

/***/ }),

/***/ 3129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),

/***/ 6417:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");;

/***/ }),

/***/ 8614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 2413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),

/***/ 3867:
/***/ ((module) => {

"use strict";
module.exports = require("tty");;

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nccwpck_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(2186);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__nccwpck_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(2850);
/* harmony import */ var _nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__nccwpck_require__.n(_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(5747);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__nccwpck_require__.n(fs__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __nccwpck_require__(5622);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__nccwpck_require__.n(path__WEBPACK_IMPORTED_MODULE_3__);




const getRequiredInput = (input) => (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)(input, { required: true });
const deviceId = getRequiredInput('device id');
const appVersion = getRequiredInput('app version');
const target = getRequiredInput('target');
const network = getRequiredInput('network');
const secTag = parseInt(getRequiredInput('sec tag'), 10);
const timeoutInMinutes = parseInt(getRequiredInput('timeout in minutes'), 10);
const hexFile = getRequiredInput('hex file');
const fotaFile = getRequiredInput('fota file');
const multilineOrUndefined = (s) => s.length > 0 ? s.split('\n') : undefined;
const abortOn = multilineOrUndefined((0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('abort on'));
const endOn = multilineOrUndefined((0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('end on'));
const endOnWaitSeconds = parseInt((0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.getInput)('end on waitSeconds'), 10);
const certDir = getRequiredInput('certificate location');
const flashLogOutput = getRequiredInput('flashLog output');
const deviceLogOutput = getRequiredInput('deviceLog output');
const testEnv = {
    credentials: getRequiredInput('azure credentials'),
    location: getRequiredInput('azure location'),
    resourceGroup: getRequiredInput('azure resource group'),
    appName: getRequiredInput('app name'),
};
const powerCycle = {
    enabled: getRequiredInput('powerCycle enabled') === 'true',
    offCmd: getRequiredInput('powerCycle offCmd'),
    onCmd: getRequiredInput('powerCycle onCmd'),
    waitSecondsAfterOff: parseInt(getRequiredInput('powerCycle waitSecondsAfterOff'), 10),
    waitSecondsAfterOn: parseInt(getRequiredInput('powerCycle waitSecondsAfterOn'), 10),
};
const atHost = target === 'thingy91_nrf9160ns'
    ? _nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.atHostHexfile.thingy91
    : _nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.atHostHexfile["9160dk"];
const main = async () => {
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'appVersion', appVersion);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'target', target);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'network', network);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'secTag', secTag);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'timeoutInMinutes', timeoutInMinutes);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'hexFile', hexFile);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'fotaFile', fotaFile);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'abortOn', abortOn);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'endOn', endOn);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'endOn wait seconds', endOnWaitSeconds);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'testEnv', testEnv);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, certDir);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, powerCycle);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'flashLogOutput', flashLogOutput);
    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.debug)(deviceId, 'deviceLogOutput', deviceLogOutput);
    if (powerCycle.enabled) {
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Power cycling device`);
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Turning off ...`);
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, powerCycle.offCmd);
        await (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.runCmd)({ cmd: powerCycle.offCmd });
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Waiting ${powerCycle.waitSecondsAfterOff} seconds ...`);
        await new Promise((resolve) => setTimeout(resolve, powerCycle.waitSecondsAfterOff * 1000));
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Turning on ...`);
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, powerCycle.onCmd);
        await (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.runCmd)({ cmd: powerCycle.onCmd });
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Waiting ${powerCycle.waitSecondsAfterOn} seconds ...`);
        await new Promise((resolve) => setTimeout(resolve, powerCycle.waitSecondsAfterOn * 1000));
    }
    const outputs = await new Promise((resolve, reject) => {
        let done = false;
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Connecting...`);
        (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.connect)({
            device: deviceId,
            atHostHexfile: atHost,
            ...(0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.log)(),
        })
            .then(async ({ connection, deviceLog, onData, onEnd }) => {
            let flashLog = [];
            const credentials = JSON.parse(await fs__WEBPACK_IMPORTED_MODULE_2__.promises.readFile(path__WEBPACK_IMPORTED_MODULE_3__.resolve(certDir, `device-${deviceId}.json`), 'utf-8'));
            (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `Setting timeout to ${timeoutInMinutes} minutes`);
            const jobTimeout = setTimeout(async () => {
                done = true;
                (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.warn)(deviceId, 'Timeout reached.');
                await connection.end();
                resolve({
                    connected: true,
                    timeout: true,
                    abort: false,
                    deviceLog,
                    flashLog,
                });
            }, timeoutInMinutes * 60 * 1000);
            onEnd(async (_, timeout) => {
                if (timeout) {
                    done = true;
                    clearTimeout(jobTimeout);
                    (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.warn)(deviceId, 'Device read timeout occurred.');
                    resolve({
                        connected: true,
                        timeout: true,
                        abort: false,
                        deviceLog,
                        flashLog,
                    });
                }
                await (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.flash)({
                    hexfile: atHost,
                    ...(0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.log)('Resetting device with AT Host'),
                });
            });
            (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, 'Flashing credentials');
            await (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.flashCredentials)({
                ...credentials,
                ...connection,
            });
            flashLog = await (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.flash)({
                hexfile: hexFile,
                ...(0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.log)('Flash Firmware'),
            });
            const terminateOn = (type, s) => {
                (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `<${type}>`, `Setting up ${type} traps. Job will terminate if output contains:`);
                s === null || s === void 0 ? void 0 : s.map((s) => (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.progress)(deviceId, `<${type}>`, s));
                const terminateCheck = (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.allSeen)(s);
                onData(async (data) => {
                    s === null || s === void 0 ? void 0 : s.forEach(async (s) => {
                        if (data.includes(s)) {
                            (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.warn)(deviceId, `<${type}>`, 'Termination criteria seen:', s);
                        }
                    });
                    if (terminateCheck(data)) {
                        if (!done) {
                            done = true;
                            (0,_nordicsemiconductor_firmware_ci_device_helpers__WEBPACK_IMPORTED_MODULE_1__.warn)(deviceId, `<${type}>`, 'All termination criteria have been seen.');
                            clearTimeout(jobTimeout);
                            if (type === 'endOn')
                                await new Promise((resolve) => setTimeout(resolve, (endOnWaitSeconds !== null && endOnWaitSeconds !== void 0 ? endOnWaitSeconds : 60) * 1000));
                            await connection.end();
                            resolve({
                                connected: true,
                                abort: false,
                                timeout: false,
                                deviceLog,
                                flashLog,
                            });
                        }
                    }
                });
            };
            if (abortOn !== undefined)
                terminateOn('abortOn', abortOn);
            if (endOn !== undefined)
                terminateOn('endOn', endOn);
        })
            .catch(reject);
    });
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setOutput)('connected', outputs.connected);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setOutput)('abort', outputs.abort);
    (0,_actions_core__WEBPACK_IMPORTED_MODULE_0__.setOutput)('timeout', outputs.timeout);
    await Promise.all([
        fs__WEBPACK_IMPORTED_MODULE_2__.promises.writeFile(deviceLogOutput, outputs.deviceLog.join('\n'), 'utf-8'),
        fs__WEBPACK_IMPORTED_MODULE_2__.promises.writeFile(flashLogOutput, outputs.flashLog.join('\n'), 'utf-8'),
    ]);
};
void main();

})();

module.exports = __webpack_exports__;
/******/ })()
;