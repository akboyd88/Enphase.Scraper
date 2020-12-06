const EnphaseScraper = require("./EnphaseScraper");
const Logger = require('./Logger');

const client = require('prom-client');

const gauge = new client.Gauge({ name: 'wattHours', help: 'Instanteous Watt Hours' });


const scraper = new EnphaseScraper(process.env.ENPHASE_HOSTNAME, process.env.ENPHASE_SCRAPE_INTERVAL);
const dataHandler = (data) =>{
    Logger.info("Data received ",data);
    
};

scraper.addListener(dataHandler);
scraper.start();

process.on('SIGINT', function() {
    Logger.info("Stopping");
    scraper.removeListener(dataHandler);
    scraper.stop();
});