const http = require("http");
const logger = require('./Logger');
/**
 * Scrapes enphase api to get production data
 */
class EnphaseScraper {
    hostname;
    interval;
    listeners;
    intervalHandle;

    /**
     *
     * @param hostname the ip address or hostname of the enphase api server
     * @param interval interval in milliseconds at which the api server data will be scraped
     */
    constructor(hostname, interval) {
        this.hostname = hostname;
        this.interval = interval;
        this.listeners = {};
    }

    /**
     * Start the scraping of the enphase api server
     */
    start() {
        this.stop();
        this.intervalHandle = setInterval(()=>{
            this.scrape();
        }, this.interval);
    }

    /**
     * Scrapes the api server
     */
    scrape(){
        try {
            http.get({
                hostname: this.hostname,
                port: 80,
                path: "/production.json",
                headers: {
                    "Accept": "application/json"
                }
            }, (res) => {
                let jsonStr = '';
                res.on('data', (chunk) => {
                    jsonStr += chunk;
                });

                // called when the complete response is received.
                res.on('end', () => {
                    let data = JSON.parse(jsonStr);
                    let listeners = Object.keys(this.listeners);
                    listeners.forEach((key) => {
                        this.listeners[key](data);
                    });
                });
            }).on('error', (err)=>{
                logger.error("Error during request " + err);
            })
        } catch (Error) {
            logger.error("Error while sending request", Error)
        }
    }

    /**
     * Stop the scraping of the enphase api server
     */
    stop() {
        if(this.intervalHandle) clearInterval(this.intervalHandle);
        this.intervalHandle = null;
    }

    /**
     * Add a listener that receives scraped date
     * @param listener
     */
    addListener(listener){
        this.listeners[listener] = listener;
    }

    /**
     * Remove a listener so it no longer receives scraped data
     * @param listener
     */
    removeListener(listener){
        delete this.listeners[listener];
    }
}

module.exports = EnphaseScraper;

