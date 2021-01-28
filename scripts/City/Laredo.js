const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let options = new chrome.Options();
options.addArguments("--no-sandbox");
options.addArguments("--headless");
const HTMLParser = require('node-html-parser');

const Utility = require('../scrape-utilities.js');

// Update DevOps

const scrape = async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let events = [];
    let errors = [];


    try {
        await driver.get('https://www.cityoflaredo.com/council-agendas.html');
        let element = await driver.findElement(By.tagName('iframe'));
        let tableHtml = await element.getAttribute('src');

        await driver.get(tableHtml);
        let secElement = await driver.findElement(By.css("table[width='709']"));
        let secTableHtml = await secElement.getAttribute('innerHTML');

        let root = HTMLParser.parse(secTableHtml);
        let rows = root.querySelector("tbody").querySelectorAll('tr');
        let title;
        const meetingTime = '5:30 PM';
        let date;
        let link;

        debugger;

        for (let i = 3; i < rows.length - 2; i++) {

            const row = rows[i].querySelectorAll('td');

            title = row[0].text.replace('\n      ', ' ');

            date = row[1].text.replace(/-/g, '/') + '20' + ' ' + meetingTime;

            link = 'https://www.cityoflaredo.com/city-council/council-activities/council-agendas/2020Agendas/' + row[1].querySelector('a').getAttribute('href')

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
