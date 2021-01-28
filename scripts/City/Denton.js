const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let options = new chrome.Options();
options.addArguments("--no-sandbox");
options.addArguments("--headless");
const HTMLParser = require('node-html-parser');

const Utility = require('../scrape-utilities.js');



const scrape = async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let events = [];
    let errors = [];


    try {
        await driver.get('https://dentontx.new.swagit.com/views/5');
        let element = await driver.findElement(By.css('.panel-outer'));
        let tableHtml = await element.getAttribute('innerHTML');

        let root = HTMLParser.parse(tableHtml);
        let rows = root.querySelector("tbody").querySelectorAll('tr');
        let title;
        let meetingTime;
        let date;
        let link;

        debugger;

        for (let i = 0; i < rows.length; i++) {

            const row = rows[i].querySelectorAll('td');

            title = row[0].querySelector('a').text;

            date = row[1].text.substr(0, 12);

            meetingTime = row[1].text.substr(13, 20);

            date = `${Utility.processNamedMonthDate(date)} ${meetingTime}`;

            link = 'https://dentontx.new.swagit.com/' + row[0].querySelector('a').getAttribute('href');

            let event = {
                Name: title,
                Date: date,
                AgendaUrl: link
            };

            events.push(event);


        }
    } catch (err) {
        console.log(err)
    } finally {
        await driver.quit();
    }

    return {
        Events: events,
        Errors: errors
    };

};

module.exports = scrape;


let result = scrape().then(r => {

    console.log(r);
});
