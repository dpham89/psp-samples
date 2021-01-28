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

    /* Example of what the URL will look like */
    /* https://pearlandtx.civicweb.net/Portal/MeetingInformation.aspx?Org=Cal&Id=530 */
    try {
        await driver.get('https://www.pearlandtx.gov/government/agendas/city-council');
        let element = await driver.findElement(By.css('.upcoming-meeting-list'));
        let tableHtml = await element.getAttribute('innerHTML');

        let root = HTMLParser.parse(tableHtml);
        let rows = root.querySelectorAll("li");

        let title;
        const meetingTime = "6:30 PM";
        let date;
        let link;

        debugger;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const linkElement = row.querySelector("a");

            if (linkElement) {

                link = "https://pearlandtx.civicweb.net" + linkElement.getAttribute("href");
                title = linkElement.text.trim();

            } else {

                const spans = row.querySelectorAll("span");
                link = undefined;

                for (let span of spans) {

                    title = span.text.trim();

                    if (title.length > 0) {
                        break;
                    }
                }
            }

            let elements = title.split("-");

            title = elements[0].trim();
            let dateString = elements[1].trim();

            date = `${Utility.processNamedMonthDate(dateString)} ${meetingTime}`;



            let event = {
                Name: title,
                Date: date,
                AgendaUrl: link
            };

            events.push(event);


        }
    } catch (err) {
        console.log(err.messsage);
    } finally {
        await driver.quit();
    }

    return {
        Events: events,
        Errors: errors
    };

};


function parseDate(date) {

    let output = {};
    let elements = date.replace(",", "").split(" ");

    if (elements.length < 3) {
        return {
            month: "01",
            day: "01",
            year: "0001"
        };
    }

    let month = elements[0].trim();
    output.month = Utility.monthNumberFromName(month);


    let day = "00" + elements[1].trim();

    output.day = day.substr(day.length - 2);
    output.year = elements[2].trim();

    return output;

};

module.exports = scrape;

let result = scrape().then(r => {

    console.log(r);
});
