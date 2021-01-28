﻿const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let options = new chrome.Options();
options.addArguments("--no-sandbox");
options.addArguments("--headless");
const HTMLParser = require('node-html-parser');

const Utility = require('../scrape-utilities.js');

// NOTE: Added to DevOps

const scrape = async () => {

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let events = [];
    let errors = [];


    try {
        await driver.get('https://sanantonio.legistar.com/DepartmentDetail.aspx?ID=22661&GUID=999BA422-A775-4DE3-8ABD-1B4851E69C96&Mode=MainBody');
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

            link = 'https://sanantonio.legistar.com/' + elements[5].querySelector('a').getAttribute('href');

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
