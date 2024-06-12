const { chromium } = require("playwright");

//Needed import to write data to a csv file
const { writeToPath } = require('@fast-csv/format'); // This requires: "npm install fast-csv" in terminal!

async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com");

  //          //          //          The Titles:          //          //          //

  let tenSpans = await page.$$("(//span[@class='titleline'])[position()<11]/a[@href]")
  let titleArr = [];

  for (let spn of tenSpans) {
    let aTitle = await spn.textContent(); //aTitle will print title 
    titleArr.push(aTitle)
  } //titleArr is an array contains all titles

  //          //          //          The URL links:          //          //          //

  let theUrls = await page.$$("(//span[@class='titleline'])[position()<11]")

  let urlArr = [];
  for (let url of theUrls) {
    let totalHtml = await url.innerHTML();

    // Grabbing only the url out the previously grabbed html string
    let twoPieceArray = totalHtml.split(' ')
    let m = twoPieceArray[1].toString();
    let z = m.split('>');
    let a = z[0]; // "a" is a str, and "a" contains: href="https://tree-diffusion.github.io/"
    let b = a.split('href="')
    let c = b[1] // "c" is a str, and "c" contains: "https://tree-diffusion.github.io/"
    let d = c.slice(0, -1); // got it! "d" contains https://tree-diffusion.github.io/ (unless it's a local url, then it doesn't have https:// in the front of it, which is solved in the next lines below)

    // in the case that "d" is a local url, we must attach an extra string in front to make the URL complete
    if (!d.startsWith('http')) {
      d = "https://news.ycombinator.com/" + d;
    }

    urlArr.push(d) //urlArr is an array that contains all urls
  }

  //          //          //          Combining Titles and URL links          //          //          //

  let arrOfObjs = []
  for (i = 0; i < 10; i++) {
    arrOfObjs.push({
      Title: titleArr[i],
      URL: urlArr[i]
    });
  }

  //          //          //          Writing data to a csv file          //          //          //

  const path = `titlesAndUrls.csv`;
  const data = arrOfObjs;
  const options = { headers: true, quoteColumns: true };

  writeToPath(path, data, options)
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Finished writing to csv file.'));

  //and finally, close browser window
  await browser.close();
}

(async () => {
  await saveHackerNewsArticles();
})();