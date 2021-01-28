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

    debugger;


    try {
        await driver.get("https://beaumonttexas.gov/city-calendar-of-events/");
        await driver.findElement(By.css('.fc-button.fc-button-rhc_event')).click();
        await driver.wait(until.elementLocated(By.xpath("//strong[contains(text(),'Click')]")));
        let element = await driver.findElement(By.css('.fc-content'));
        let listHtml = await element.getAttribute('innerHTML');
        let root = HTMLParser.parse(listHtml);
        let items = root.querySelectorAll("div.fc-event-list-item");

        for (let i = 1; i < items.length; i++) {

            const item = items[i];

            let title = item.querySelector("a.fc-event-link.fc-event-list-title").innerHTML;
            if (!title.includes("No ")) {
                let date = item.querySelector("span.fe-extrainfo-value.fc-start").innerHTML;
                let processedDate = Utility.processNamedMonthDate(date);
                let time = item.querySelector("span.fe-extrainfo-value.fc-time").innerHTML;
                let meetingDate = `${processedDate} ${time}`;

                let content = item.querySelector("div.fc-event-list-description.dbox-description");
                let description = content.innerHTML.trim().replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, ' ').split('Click here')[0].replace(/\n/g, '');
                let link = content.querySelector("a").getAttribute("href");

                let event = {
                    Name: title,
                    Date: meetingDate,
                    AgendaUrl: link,
                    //Description: description
                };

                events.push(event);
            }
        }
    } catch (err) {
        console.log(err.messsage);

    } finally {
        await driver.quit();
    }

    return JSON.stringify({
        Events: events,
        Errors: errors
    });


    function processDate(date) {
        let monthText = date.split(",")[0].split(" ")[0];

        let day = date.split(",")[0].split(" ")[1];

        let year = date.split(",")[1];

        let processedDate = `${month}/${day}/${year} 05:30 PM`;
        return processedDate;

    }


};
module.exports = scrape;
let result = scrape().then(r => {

    console.log(r);
});
