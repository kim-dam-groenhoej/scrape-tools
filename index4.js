const puppeteer = require('puppeteer');
const jsonfile = require('fs');
const fs = require('jsonfile');
//const $ = require('jquery')(require("jsdom").jsdom().parentWindow);

async function GetCategoryInfo(page, li, i)
{
  url = li.href;

  await page.goto(
    url,
    {"waitUntil" : "networkidle2"}
  );

  let keywords = null;
  try {
    keywords = await page.$eval('meta[name="keywords"]', function(meta) {
      return  Promise.resolve({
        "value" : meta.getAttribute("content")
      });
    });
  } catch (err) {

  }

  let description = null;
  try {
    description = await page.$eval('meta[name="description"]', function(meta) {
      return  Promise.resolve({
        "value" : meta.getAttribute("content")
      });
    });
  } catch (err) {

  }

  let title = null;
  try {
    title = await page.$eval('title', function(meta) {
      return  Promise.resolve({
        "value" : meta.innerHTML
      });
    });
  } catch (err) {

  }

  // let pagePictureUrl = await page.$$eval('.container.catalog-view img', function(imgs) {

  //   function isEmptyOrSpaces(str){
  //     return str === null || str.match(/^ *$/) !== null;
  //   }

  //   let imageUrL = "";
  //   if (imgs.length > 0 && 
  //     isEmptyOrSpaces(imgs[0].parentElement.className.trim())
  //     && !(imgs[0].className.indexOf('product_katalog_img') !== -1)) {

  //     imageUrL = imgs[0].getAttribute("src");
  //   }

  //   return  Promise.resolve({
  //     "value" : imageUrL
  //   });
  // });
  
  // let pageDescriptions = await page.$$eval('.container.catalog-view .row .col-md-12 > .font-noyh', function(descriptions) {
  //   let objs = [];
  //   for (l = 0; l < descriptions.length; ++l) {

  //     let product_container = descriptions[l].getElementsByClassName("product_container");
  //     if (product_container.length == 0) {
  //       objs.push({
  //         "description" : descriptions[l].innerHTML
  //       });
  //     }
  //   }

  //   return  Promise.resolve({
  //     "value" : objs
  //   });
  // });

  
  if (keywords != null) li.keywords = keywords.value;
  if (description != null) li.metaDescription = description.value;
  if (title != null) li.title = title.value;
  // if (keywords != null) li.pageDescriptions = pageDescriptions.value;
  // if (keywords != null) li.pagePictureUrl = pagePictureUrl.value;

  let links = await page.$$eval('#productmenucontainer .level' + i.toString() + ' li > a, #submenu li > a', function(spans) {
    let objs = [];
    var str = "";
    for (p = 0; p < spans.length; ++p) {
      let span = spans[p];

      objs.push({
        "name" : span.innerHTML,
        "href" : span.getAttribute('href'),
        "subs" : []
      });
    }
    
    return  Promise.resolve({
      "value" : objs
    });
  });

  li.subs = links.value;
}

async function run(username,password) {
    const browser = await puppeteer.launch({
       headless: true
    });
    const page = await browser.newPage();
  
    await page.goto(
      'https://domain.dk/maerker/511-tactical/', {"waitUntil" : "networkidle2"}
    );


    let links = await page.$$eval('#productmenucontainer .level1 li > a', function(spans) {
      let objs = [];
      var str = "";
      for (p = 0; p < spans.length; ++p) {
        let span = spans[p];

        //let ul = span.parentElement.parentElement.getElementsByTagName("ul");

        // let megaMenuLi = span.closest(".megamenu").getElementsByTagName("a")[0];

        // let ul = span.parentElement.parentElement.getElementsByTagName("ul");
        // let subLis = [];
        // if (ul.length > 0) {
        //   let lis = ul[0].getElementsByTagName("li");

        //   for (l = 0; l < lis.length; ++l) {
        //     let ll = lis[l];
        //     let url = ll.getElementsByTagName("a")[0].getAttribute('href');

        //     subLis.push({
        //       "name" : ll.innerHTML,
        //       "href" : url
        //     });
        //   }
        // }

        objs.push({
          "name" : span.innerHTML,
          "href" : span.getAttribute('href'),
          "subs" : []
        });
      }
      
      return  Promise.resolve({
        "value" : objs
      });
    });
   
    await loopLisRecursive(page, links.value, 1);

    // await page.type('[name="username"]', username);
    // //await page.click('#t3-password');
    // await page.type('[name="password"]', password);
    // const inputElement = await page.$('input[type=submit]');
    // await inputElement.click();
  
    //await page.waitForNavigation();

    var file = './categories2.json';
    jsonfile.writeFileSync(file, JSON.stringify(links.value));

    browser.close();
  }

  async function loopLisRecursive(page, lis, i) {
    i = i + 1;

    for (var l = 0, count = lis.length; l < count; l++) {
      let li = lis[l];

      await GetCategoryInfo(page, li, i);

      if (li.subs != null && li.subs.length > 0 && i < 4) {
        await loopLisRecursive(page, li.subs, i);
      } else {
        li.subs = [];
      }
    }
  }


  async function GetProductDataAsync(a) {
      let browser = a.browser;
      let products = a.products;
      let product = a.product;
      let taskPage = await browser.newPage();
    
      if (product.id != null && product.identifier_id != null) {
        await taskPage.goto(
          'https://www.sirup.dk/editor/mod/webshop/index.php?mode=edit_products&id=' + product.id + '&identifier_id=' + product.identifier_id,
          {"waitUntil" : "networkidle2"}
        );

        await taskPage.waitFor(500);

        let ids = await taskPage.$$eval('select[id="related_select1"] option', function(imgs) {
            let objs = [];
            for (p = 0; p < imgs.length; ++p) {
              let img = imgs[p];
              objs.push({
                "id" : img.getAttribute('value')
              });
            }
            
            return  Promise.resolve({
              "value" : objs
            });
        });
     
        let p = {
            "productId" : product.identifier_id,
            "relatedProductIds" : ids.value
        };
        
        products.push(p);
      
        taskPage.close();
      }

      // let title = await taskPage.$eval('input[name="data[tx_tcshop_domain_model_product][' + element.id + '][title]"]', function(input) {
      //   return  Promise.resolve({
      //     "value" : input.getAttribute('value')
      //   });
      // });


      // let mediaButton = await taskPage.$('[id="DTM-3364ee0675-4-MENU"]');
      // await mediaButton.click();
      //await taskPage.waitFor(1000);
      // console.log(await taskPage.content());

      // var file = './test2.json';
      // jsonfile.writeFileSync(file, await taskPage.content());

      // let mediaFolderBtn = await taskPage.$('[id*="-colorbox-tx_tcshop_domain_model_colorbox-"]');
      // mediaFolderBtn.click();

      // await taskPage.waitFor(1000);

      // var cdnDomain = 'https://d19w2oklxkyhbo.cloudfront.net/fileadmin/user_upload/';
      // let images = await taskPage.$$eval('.t3-form-field-header-inline-thumbnail', function(imgs) {
      //   let objs = [];
      //   for (p = 0; p < imgs.length; ++p) {
      //     let img = imgs[p];
      //     objs.push({
      //       "url" : cdnDomain + img.getAttribute('alt')
      //     });
      //   }
        
      //   return  Promise.resolve({
      //     "value" : objs
      //   });
      // });
      // console.log(images);
      
      // products.push({
      //   "title" : title.value,
      //   "price" : price.value,
      //   "discount" : discount.value,
      //   "code" : code.value,
      //   "weight" : weight.value,
      //   "stock" : stock.value,
      //   "delivery" : delivery.value,
      //   "keywords" : keywords.value,
      //   "description" : description.value,
      //   "images" : images.value
      // });

      // if (taskPage != null) {
      //   await taskPage.close();
      // }
  }

  async function GetProductsAsync(page, browser)
  {
      var products = [];
      
      let productIds = fs.readFileSync("createjson.json");

      let pageNumber = 0;
      let pages = productIds.length / 20;
      console.log('total pages ' + pages);
      while (pageNumber < pages) {
        console.log('pageNumber ' + pageNumber);
        let items = [];
        let newArray = await productIds.slice(pageNumber * 20, (pageNumber * 20) + 20);

        for (var i = 0; i < newArray.length; i++) {
          items.push({
            "browser" : browser,
            "products" : products,
            "product" : newArray[i]
          });
        }

        try {
          let promies = await items.map(GetProductDataAsync);
          await Promise.all(promies);
        }
        catch(err) {
          console.log('error' + err.message);
        }

        pageNumber++;
      }

      var file = './products2.json';
      jsonfile.writeFileSync(file, JSON.stringify(products));
  }

  async function GetProductsData(page, browser) {
    await page.goto(
      'https://tacout.dk/typo3/mod.php?&M=web_list&id=474&table=tx_tcshop_domain_model_product&imagemode=1&pointer=0',
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

    for (p = 0; p < 1; ++p) {
      console.log("product page started " + p);

      let productElements = await page.$$eval('table tr td[class="col-icon"] span', 
        function(spans) {
          let elements = [];
          for (index = 0; index < spans.length; ++index) {
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

      var products = [];
      var items = [];
      console.log('Count begin synched ' + productElements.length);
      for (index = 0; index < productElements.length; ++index) {
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
    }

    //console.log(products);
    var file = './products.json';
    jsonfile.writeFileSync(file, JSON.stringify(products));
  }

  run("mette", "sirup2016");
