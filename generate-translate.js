const commandLineArgs = require('command-line-args')
const GoogleSpreadsheet = require('google-spreadsheet')
const bluebird = require('bluebird')
const unflatten = require('unflatten')
const fs = require('fs')
const util = require('util')
const jsBeautifier = require('js-beautify')
const yamlBeautifier = require('align-yaml')
const CONST = require('./const')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const defaultOptions = {
  outputFormat: 'js',
  locale: 'fr',
  gid: '',
  sourceDir: './',
  outputDir: './'
}

const optionDefinitions = [
  {name: 'locale', alias: 'l', type: String},
  {name: 'gsid', alias: 'g', type: String},
  {name: 'outputFormat', alias: 'o', type: String},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'sourceDir', alias: 's', type: String},
  {name: 'outputDir', alias: 'd', type: String},
  {name: 'credentialsPath', alias: 'c', type: String}
]

const cliOptions = commandLineArgs(optionDefinitions)
const mandatoryFields = [CONST.MANDATORY_FIELDS.CREDENTIALS_PATH]
const allowedOutputFormat = ['js', 'csv']

if (cliOptions.hasOwnProperty('help')) {
  help()
  process.exit(0)
}

// Check mandatory fields
mandatoryFields.forEach(field => {
  if (!cliOptions[field]) {
    console.log(`${field} is mandatory`)
    help()
    process.exit(1)
  }
})

const options = Object.assign(defaultOptions, cliOptions)
let credentials
try {
  credentials = require(cliOptions[CONST.MANDATORY_FIELDS.CREDENTIALS_PATH])
} catch (error) {
  console.error('Unable to load file at path : ' + cliOptions[CONST.MANDATORY_FIELDS.CREDENTIALS_PATH])
  process.exit(1)
}


// Checks
if (!allowedOutputFormat.includes(options['outputFormat'])) {
  console.log(`outputFormat ${options['outputFormat']} is not implemented`)
  process.exit(1)
}

if (options['outputFormat'] === 'js') {
  const spreadsheet = new GoogleSpreadsheet(options['gsid'])
  const authPromise = bluebird.promisify(spreadsheet.useServiceAccountAuth)
  const getRowsPromise = bluebird.promisify(spreadsheet.getRows)

  console.log('Authenticating...')

  return authPromise({
    client_email: credentials['client_email'],
    private_key: credentials['private_key']
  })
  .then(() => {
    console.log('Fetching cells...')
    return getRowsPromise(1, {'offset': 1,'limit': 10000})
  })
  .then(data => {
    console.log('Generating translations file...')
    let translatedPayload = {}
    data.forEach(row => {
      translatedPayload[row['translationkey']] = row['translatedtext']
    })

    let finalPayload = {
      [options['locale']]: unflatten(translatedPayload)
    }

    if (options['outputFormat'] === 'js') {
      fs.writeFileSync(`${options['outputDir']}${options['locale']}.js`, jsBeautifier(`module.exports = ${util.inspect(finalPayload, false, null)}`, {indent_size: 2}) + '\n')
    } 
    // else {
    //   fs.writeFile(
    //     `${options['outputDir']}${options['locale']}.yaml`, 
    //     yamlBeautifier(util.inspect(finalPayload, false, null).replace(/{/g, '').replace(/}/g, ''), 4)
    //   )
    // }

    console.log('Done.')

  })
  .catch(error => {
    console.error(error)
  })
}

if (options['outputFormat'] === 'csv') {
  const sourceFile = require(`${options['sourceDir']}${options['locale']}.js`)
  const entries = Object.entries(sourceFile)[0][1]
  const data = []
  const datas = loopThroughObject(entries, '', data)

  const csvWriter = createCsvWriter({
    path: `${options['locale']}.csv`,
    header: [
      {id: 'translationkey', title: 'translationkey'},
      {id: 'translatedtext', title: 'translatedtext'}
    ]
  })
  console.log(datas)
  csvWriter
    .writeRecords(datas)
    .then(() => console.log('The CSV file was written successfully'))
}

function help () {
  console.log(`
Fetching columns from a spreadsheet and generate a translate file 

Arguments : 
--locale, -l : locale of the file. The name of the file generated will be the name of the locale. Default : 'fr'
--gsid, -g : Spreadsheet ID
--outputFormat, -o : Output format. For now, only JS is available. Default: 'JS'
--help, -h : Display help
--outputDir, -d : Output path file. Current directory by default. Default : './'
--credentialsPath, -c : Path to google credentials file

Example : 

node node_modules/.bin/generate-translate.js -g 14ESdKxdEktB4rLesYlIMMve6aapCT2Q2jGB17F466W6mo -o js -l fr
// Generate a file name 'fr.js' based on spreadsheet ID 14ESdKxdEktB4rLesYlIMMve6aapCT2Q2jGB17F466W6mo
`)
  process.exit(0)
}

function loopThroughObject(object, previousKey, data) {
  Object.keys(object).map((key) => {
    let strKey
    if (key.match(/^\d+$/)) {
      strKey = '[' + key + ']'
    } else {
      if (previousKey !== '') {
        strKey = '.' + key
      } else {
        strKey = key
      }
    }

    let prevKey
    if (previousKey !== '') {
      prevKey = previousKey + strKey
    } else {
      prevKey = strKey
    }

    if (typeof object[key] !== 'object') {
      // console.log('-----------------------------------------------------------------------------------------------------------')
      // console.log(prevKey + ' | ' + object[key])

      const obj = {
        'translationkey': prevKey,
        'translatedtext': object[key]
      }

      data.push(obj)
    } else {
      loopThroughObject(object[key], prevKey, data)
    }
  })

  return data
}
