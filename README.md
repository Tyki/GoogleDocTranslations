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
