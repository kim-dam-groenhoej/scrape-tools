const puppeteer = require('puppeteer');
const fs = require('fs');
const jsonfile = require('fs');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
const $ = jQuery = require('jquery')(window);
const xml2js = require('xml2js');
const jsxml = require("node-jsxml");


  async function run(username,password) {

    var parser = new xml2js.Parser();
    var products = [];
    await fs.readFile('./mechant.xml', async function(err, data) {
      await parser.parseString(data, async function (err, result) {
            var browser = await puppeteer.launch({
                headless: true
            });
            var page = await browser.newPage();

            console.log("products number" + result.rss.channel[0].item.length)
            for (i = 0; i < result.rss.channel[0].item.length; i++) { 
                var url = result.rss.channel[0].item[i]["link"];
                await page.goto(url[0],
                   {"waitUntil" : "networkidle2"}
                );

                await page.waitFor(500);
                let colorBtns = await page.$$('[id*="choosecolorrow"]');
                let objs = []; 
                for (b = 0; b < colorBtns.length; b++) { 
                    let colorBtn = colorBtns[b];
                    let colorName = await page.$eval(colorBtn._remoteObject.description, tr => tr.getElementsByClassName("title")[0].innerHTML);
                    await colorBtn.click();
                    let obj = {
                      'color' : colorName,
                    };

                    await page.waitFor('.colorbox:not(.hidden) img',{visible:true});

                    let imgUrls = await page.$$eval('.colorbox:not(.hidden) img', 
                      function(imgs) {
                        let elements = [];
                        for (index = 0; index < imgs.length; index++) {
                          let src = imgs[index].getAttribute('src');
                          elements.push({
                            "src" : src
                          });
                        }

                        return Promise.resolve(elements);
                    });
                    obj.images = imgUrls;

                    objs.push(obj);
                }

                let p = {
                  "id" : result.rss.channel[0].item[i]["g:id"],
                  "variantImages" : objs
              };

                products.push(p);
                
                console.log(p);
            }

            var file = './productImages.json';
            jsonfile.writeFileSync(file, JSON.stringify(products));

            page.close();
            try {
              browser.close();
            } catch (error) {
        
            }
        });
    });

  }

  run("username", "password");
