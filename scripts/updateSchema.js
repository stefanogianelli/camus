import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import { camusSchema } from '../models/graphql/rootSchema';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

// Save JSON of full schema introspection for Babel Relay Plugin to use
graphql(camusSchema, introspectionQuery)
    .then(result => {
        if (result.errors) {
            console.error(
                'ERROR introspecting schema: ',
                JSON.stringify(result.errors, null, 2)
            );
        } else {
            fs.writeFileSync(
                path.join(__dirname, '../data/schema.json'),
                JSON.stringify(result, null, 2)
            );
        }
    });

// Save user readable type system shorthand of schema
fs.writeFileSync(
  path.join(__dirname, '../data/schema.graphql'),
  printSchema(camusSchema)
);
