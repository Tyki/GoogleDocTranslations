# Spreadsheet Translator

This tool generate translation files based on a google spreadsheet


TODO : 
- YAML Output 

# Pre-requirements

In order to make it works, you need a service key from Google Cloud Platform

```
- Google Cloud platform > Burger Menu > "APIs & Services" > Credentials
- "Create Credentials" > "Service account key"
- Create a new key with json format
- Save and download the key
```

# How to install

```
npm install --save-dev spreadsheet-translator
```

# Usage 

```
node node_modules/.bin/generate-translate.js -g 14ESdKxdEktB4rLesYlIMMve6aapCT2Q2jGB17F466W6mo -o js -l fr -c ./key.json
```

# Arguments: 

```
--locale, -l : locale of the file. The name of the file generated will be the name of the locale. Default : 'fr'
--gsid, -g : Spreadsheet ID
--outputFormat, -o : Output format. For now, only JS is available. Default: 'JS'
--help, -h : Display help
--outputDir, -d : Output path file. Current directory by default. Default : './'
--credentialsPath, -c : Path to google credentials file
```

# Spreadsheet format

The spreadsheet must be in a specific format.
For the moment, the script only take the first tab of the spreadsheet

First column will be the keys
Second column will be translated values

Here is an example : 

[Spreadsheet sample](https://imgur.com/8Ic5zcw)

Output generated : 

```
module.exports = {
  'fr': {
    mykey: 'My translation',
    my: {
      nested: {
        key: 'My second translation
      }
    },
    more: {
      nested: {
        key: {
          in: {
            nested: {
              key: 'My third translation'
            }
          }
        }
      }
    }
  }
}
```
