const express = require('express');
const reader = require('xlsx');
const app = express();
const port = 5000;
const Wappalyzer = require('wappalyzer');

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

// Reading our test file
const file = reader.readFile('./test.xlsx');

let data = [];

const sheets = file.SheetNames;

for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
        file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
        data.push(res)
    })
}

const urls = data?.map((item) => item.urls);

function analyseUrl(url) {
    const options = {
        debug: false,
        delay: 500,
        maxDepth: 0,
        maxUrls: 2,
        maxWait: 15000,
        recursive: true,
        htmlMaxCols: 2000,
        htmlMaxRows: 2000,
    };
    const wappalyzer = new Wappalyzer(options);

    return new Promise((resolve, reject) => {
        wappalyzer.open(url).analyze()
            .then(json => {
                for (let i = 0; i < json.technologies?.length; i++) {
                    if (json.technologies[i].name === "Magento" || json.technologies[i].name === "Magento 2") {
                        resolve(true);
                    }
                }
                resolve(false);
            })
            .catch(error => {
                reject(error);
            });
    });
}

(async function wappalyze() {
    let magentoUrls = [];
    for (let i = 0; i < 10; i++) {
        console.log('Testing URL: ' + urls[i]);
        let isMagento = await analyseUrl(urls[i]);
        if (isMagento) {
            magentoUrls.push(urls[i]);
        }
    }
    console.log(magentoUrls, 'magentoUrls');
    process.setMaxListeners(0);
    process.exit(0);
}());


// const ws = reader.utils.json_to_sheet(data)
//
// reader.utils.book_append_sheet(file,ws,"Sheet3")
//
// reader.writeFile(file,'./test1.xlsx')