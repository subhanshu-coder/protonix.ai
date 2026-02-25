import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

const rawSourceMap = JSON.parse(fs.readFileSync('./dist/assets/index-BBi7FspM.js.map', 'utf8'));

SourceMapConsumer.with(rawSourceMap, null, consumer => {
    // We don't have the exact line for index-BBi7FspM.js, but the user reported index-Wl2hD-NO.js:4121 and 38.
    // We can search the source map for original files that might contain ".md" or "md".

    let mdUsages = [];
    consumer.eachMapping(m => {
        if (m.name && m.name.includes('md')) {
            mdUsages.push({
                source: m.source,
                line: m.originalLine,
                column: m.originalColumn,
                name: m.name
            });
        }
    });

    console.log(mdUsages.slice(0, 20)); // Limit output
});
