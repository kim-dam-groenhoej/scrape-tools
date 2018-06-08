const puppeteer = require('puppeteer');
const jsonfile = require('fs');
const fs = require('jsonfile');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
const $ = jQuery = require('jquery')(window);

  async function run(username,password) {
    const browser = await puppeteer.launch({
       headless: true
    });
    const page = await browser.newPage();

    await page.goto(
      'https://domain.dk/typo3/index.php', {"waitUntil" : "networkidle2"}
    );

    await page.type('[id="t3-username"]', username);
    await page.type('[id="t3-password"]', password);
    const inputElement = await page.$('input[type=submit]');
    await inputElement.click();
  
    await page.waitForNavigation();

    await GetProductsData(page, browser);

    try {
      browser.close();
    } catch (error) {

    }
  }

  async function GetProductsDataFrontend(page, browser) {
    let productElements = await page.$$eval('.level1 li a', 
      function(links) {
        let elements = [];
        for (index = 0; index < links.length; index++) {
          let href = links[index].getAttribute('href');
          elements.push({
            "href" : href
          });
        }

        return Promise.resolve(elements);
    });

    var products = [];
    var items = [];
    console.log('Count begin synched ' + productElements.length);
    for (index = 0; index < productElements.length; index++) {
      items.push({
        "browser" : browser,
        "products" : products,
        "element" : productElements[index]
      });
    }

    let promies = items.map(GetProductDataAsyncFrontend);
    await Promise.all(promies);

    console.log('Count synched ' + products.length);
    console.log("product page ended " + p);

    var file = './productsfrontend.json';
    jsonfile.writeFileSync(file, JSON.stringify(products));
  }

  
  async function GetProductDataAsyncFrontend(a) {
    let browser = a.browser;
    let products = a.products;
    let element = a.element;
    let taskPage = await browser.newPage();

    await taskPage.goto(
      element.href,
      {"waitUntil" : "networkidle2"}
    );

    await page.waitFor('.submenu li a',{visible:true});

    let productElements = await taskPage.$$eval('.submenu li a', 
        function(links) {
          let elements = [];
          for (index = 0; index < links.length; index++) {
            let href = links[index].getAttribute('href');
            elements.push({
              "href" : href
            });
          }

          return Promise.resolve(elements);
    });
}

  async function GetImages(page, description, number) {
    let images2 = [];
    console.log(number);

    let description2 = await stripHtml(description);

    if (description2.length > 250) {
      description2 = description2.substring(1, 250);
    }
    console.log(description2);
    await page.goto(
        'https://domain.dk/soegning/?q=' + description2 + '&submit=1', {"waitUntil" : "networkidle2"}
    );

    await page.waitFor('a.gs-title',{visible:true});
    var urlTag = await page.$eval('a.gs-title', function(a) {
      return Promise.resolve({
        "value" : a.getAttribute("href")
      });
    });
    
    await page.goto(
      urlTag.value, {"waitUntil" : "networkidle2"}
    );
    
    await page.waitFor('.images .image',{visible:true});
    images2 = await page.$$eval('.images .image img', function(imgs) {
      let objs = [];
      for (p = 0; p < imgs.length; p++) {
        let img = imgs[p];
        objs.push({
          "url" : img.getAttribute('src')
        });
      }
      
      return Promise.resolve({
        "value" : objs
      });
    });

    return images2;
  }

  async function GetProductDataAsync(a) {
      let browser = a.browser;
      let products = a.products;
      let element = a.element;
      let taskPage = await browser.newPage();

      await taskPage.goto(
        'https://domain.dk/typo3/alt_doc.php?returnUrl=mod.php%3F%26M%3Dweb_list%26id%3D474%26table%3Dtx_tcshop_domain_model_product%26imagemode%3D1&edit[tx_tcshop_domain_model_product][' + element.id + ']=edit',
        {"waitUntil" : "networkidle2"}
      );

      await taskPage.waitFor(1000);

      let title = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][title]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });
      
      let price = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][price]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let discount = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][discount]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let code = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][code]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let weight = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][weight]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let stock = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][stock]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let delivery = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][delivery]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let keywords = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][keywords]"]', function(input) {
        return  Promise.resolve({
          "value" : input.getAttribute('value')
        });
      });

      let description = await taskPage.$eval('textarea[name="data[tx_tcshop_domain_model_product][' + element.id + '][description]"]', function(input) {
        return  Promise.resolve({
          "value" : input.innerHTML
        });
      });

      let sizes = await taskPage.$$eval('[name="data[tx_tcshop_domain_model_product][' + element.id + '][size]_list"] option', function(sizes) {
        let objs = [];
        for (p = 0; p < sizes.length; p++) {
          let size = sizes[p];
          objs.push({
            "name" : size.innerHTML
          });
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      let colors = await taskPage.$$eval('.t3-form-field-header-inline-summary [id*="-colorbox-tx_tcshop_domain_model_colorbox', function(colors) {
        let objs = [];
        for (p = 0; p < colors.length; p++) {
          let color = colors[p];
          objs.push({
            "name" : color.innerHTML.split(':')[0]
          });
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      let stickers = await taskPage.$$eval('[name="data[tx_tcshop_domain_model_product][' + element.id + '][sticker]_list"] option', function(stickers) {
        let objs = [];
        for (p = 0; p < stickers.length; p++) {
          let sticker = stickers[p];
          objs.push({
            "name" : sticker.innerHTML
          });
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      let related = await taskPage.$$eval('[name="data[tx_tcshop_domain_model_product][' + element.id + '][related]_list"] option', function(relateds) {
        let objs = [];
        for (p = 0; p < relateds.length; p++) {
          let related = relateds[p];
          objs.push({
            "name" : related.innerHTML,
            "value" : related.getAttribute("value")
          });
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      let suppliers = await taskPage.$$eval('[name="data[tx_tcshop_domain_model_product][' + element.id + '][supplier]"] option', function(suppliers) {
        let objs = [];
        for (p = 0; p < suppliers.length; p++) {
          let supplier = suppliers[p];

          if (supplier.getAttribute("selected") == "selected") {
            objs.push({
              "name" : supplier.innerHTML,
              "value" : supplier.getAttribute("value")
            });
          }
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      let hide = await taskPage.$eval('[id*="_hidden"]', function(hide) {

        return  Promise.resolve({
          "value" : hide.getAttribute("checked") == "checked"
        });
      });

      let categories = await taskPage.$eval('.x-tree-root-node > .x-tree-node > .x-tree-node-ct', function(rootCategory) {
        let categories = rootCategory.children;
        
        function GetRecursiveCategories(child) {
          let categories2 = child.children;
          let objs2 = [];
          if (categories2.length > 0) {
            for (var pd = 0; pd < categories2.length; pd++) {
              let categoryd = categories2[pd];
              let aTagd = categoryd.querySelector('div.x-tree-node-el a span');
              let checkboxd = categoryd.querySelector('div.x-tree-node-el input[type=checkbox]:checked')
    
              objs2.push({
                "name" : aTagd.innerHTML,
                "subs" : GetRecursiveCategories(categoryd.querySelector(':scope > .x-tree-node-ct')),
                "selected" : checkboxd != null
              });
            }
          }

          return objs2;
        }

        let objs = [];
        for (var p = 0; p < categories.length; p++) {
          let category = categories[p];
          let aTag = category.querySelector('div.x-tree-node-el a span');

          objs.push({
            "name" : aTag.innerHTML,
            "subs" : GetRecursiveCategories(category.querySelector(':scope > .x-tree-node-ct'))
          });
        }

        return  Promise.resolve({
          "value" : objs
        });
      });

      products.push({
        "title" : title.value,
        "price" : price.value,
        "discount" : discount.value,
        "code" : code.value,
        "weight" : weight.value,
        "stock" : stock.value,
        "delivery" : delivery.value,
        "keywords" : keywords.value,
        "description" : description.value,
        //"images" : images,
        "sizes" : sizes.value,
        "colors" : colors.value,
        "stickers" : stickers.value,
        "related" : related.value,
        "suppliers" : suppliers.value,
        "categories" : categories.value,
        "hide" : hide.value
      });

      if (taskPage != null) {
        await taskPage.close();
      }
  }

  async function GetProductsData(page, browser) {
    await page.goto(
      'https://domain.dk/typo3/mod.php?&M=web_list&id=474&table=tx_tcshop_domain_model_product&imagemode=1&pointer=0',
       {"waitUntil" : "networkidle2"}
    );

    const pageIndicator = await page.$$eval('#typo3-dblist-pagination .pageIndicator', 
      function(pageIndicators) {
      
        let pageIndicator = pageIndicators[pageIndicators.length - 1];

        let content = pageIndicator.outerHTML;
        let s = content.split('af ');
        let count = s[s.length - 1].replace("</span>", "");

        return Promise.resolve(count);
    });
    console.log("product pages " + pageIndicator);

    var products = [];
    for (p = 0; p < pageIndicator; p++) {
      products = [];
      console.log("product page started " + p);

      await page.goto(
        'https://domain.dk/typo3/mod.php?&M=web_list&id=474&table=tx_tcshop_domain_model_product&imagemode=1&pointer=' + (p * 25).toString(),
         {"waitUntil" : "networkidle2"}
      );  
      
      let productElements = await page.$$eval('table tr td[class="col-icon"] span', 
        function(spans) {
          let elements = [];
          for (index = 0; index < spans.length; index++) {
            let title = spans[index].getAttribute('title');
            if (title != null) {
              let id = title.split('=')[1];
              if (id != null) {
                id = id.split(' ')[0];
              }

              elements.push({
                "id" : id
              });
            }
          }

          return Promise.resolve(elements);
      });


      var items = [];
      console.log('Count begin synched ' + productElements.length);
      for (index = 0; index < productElements.length; index++) {
        items.push({
          "browser" : browser,
          "products" : products,
          "element" : productElements[index]
        });
      }

      let promies = items.map(GetProductDataAsync);
      await Promise.all(promies);

      console.log('Count synched ' + products.length);
      console.log("product page ended " + p);

      let rawdata = jsonfile.readFileSync('./products.json');  
      let data = JSON.parse(rawdata); 

      for (index = 0; index < products.length; index++) {
        data.push(products[index]);
      }

      fs.writeFileSync('./products.json', data, function(err) {
        if (err !== null) {
          console.error(err);
        }
      });
    
      
    }
    
    console.log('Total Count synched ' + products.length);
  }

  // enter info
  run("username", "password");
