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
        await driver.get('http://portal.beaumonttexas.gov/WebLink/Browse.aspx?id=4138483&dbid=0&repo=beaumontcity');
        let element = await driver.findElement(By.css('.ui-datatable-virtual-table'));
        let tableHtml = await element.getAttribute('innerHTML');

        let root = HTMLParser.parse(tableHtml);
        let rows = root.querySelector("tbody").querySelectorAll('tr');
        let title;
        const meetingTime = '1:30 PM';
        let date;
        let link;

        debugger;

        for (let i = 0; i < rows.length; i++) {

            const row = rows[i].querySelectorAll('td');

            title = row[1].querySelector('a').text;

            date = `${title.substr(0, 10)} ${meetingTime}`;

            title = title.replace(title.substr(0, 11), '');

            link = 'http://portal.beaumonttexas.gov/' + row[1].querySelector('a').getAttribute('href');

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




let result = scrape().then(r => {

    console.log(r);
});