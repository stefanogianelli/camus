var shell = require('shelljs')

var command = './node_modules/.bin/json-server ./mockServices/db.json --routes ./mockServices/routes.json'

shell.exec(command)
