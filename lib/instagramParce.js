import puppeteer from 'puppeteer';
import cherio from 'cherio';
import fs from 'fs';
import savePath from '../savePath'

const originalURL = 'https://www.instagram.com';

const LAUNCH_PUPPETEER_OPTS = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
};

export const PAGE_PUPPETEER_OPTS = {
    networkIdle2Timeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000
};

export default async (params) => {
    try {
        const {user=false, limit,description,comments } = params;
    
        const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
        const page = await browser.newPage();
        
        await page.goto(`${originalURL}/${user}`,PAGE_PUPPETEER_OPTS);
        let images = []
        const PageContent = await page.content();
        const $ = cherio.load(PageContent);
        const regExp = /(^\/p\/*)/

        $('a').each((i,header) => {
            const href = $(header).attr('href');
            if(regExp.test(href)) images.push(href);
        })
        images = images.slice(0, limit);

        for(let i=0; i < images.length; i++)  {
            await page.goto(`${originalURL}${images[i]}`,PAGE_PUPPETEER_OPTS);
            const content = await page.content();
            const $1 = cherio.load(content);
            const imgHref = $1('article > div img').attr('src')
            const buffer = await (await page.goto(imgHref)).buffer();
            fs.writeFileSync(`${savePath}/instagram-${i}.jpg`, buffer, 'base64');
            images[i] = imgHref;
        }

        // images.map( async (item) => {
        //     await page.goto(`${originalURL}${item}`,PAGE_PUPPETEER_OPTS);
        //     const content = await page.content();
        //     const $1 = cherio.load(content);
        //     const img = $1('article div[tabindex="0"] img').each(
        //         (header) => {return $1(header).attr('href')}
        //     )
        //     return img;
        // })





        // console.log(images);

        return (
            `<pre>
                user: ${user},
                limit: ${limit},
                description: ${description},
                comments: ${comments}
            </pre>
            <div>
                image hrefs: ${
                    images.reduce((accumulator, currentValue) => accumulator + `<img src="${currentValue}"/>`, '')
                }
            </div>
            `
        )
    } catch (e) {
        return `
            <h1>Sever Error</h1>
            <p>${e.message}</p>
        `
    }   
}


