﻿const { Builder, By, Key, until } = require('selenium-webdriver');
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
        await driver.get('https://roundrock.legistar.com/Calendar.aspx');
        let element = await driver.findElement(By.css('.rgMasterTable'));
        let tableHtml = await element.getAttribute('innerHTML');

        let root = HTMLParser.parse(tableHtml);
        let rows = root.querySelector("tbody").querySelectorAll('tr');
        let title;
        let meetingTime;
        let date;
        let link;

        debugger;

        for (let i = 0; i < rows.length; i++) {

            const row = rows[i];

            let elements = row.querySelectorAll('td');

            title = elements[0].querySelector('a').text;

            date = elements[1].text;
            meetingTime = elements[3].querySelector('span').text;
            date = `${date} ${meetingTime}`

            link = 'https://roundrock.legistar.com/' + elements[6].querySelector('a').getAttribute('href');

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
