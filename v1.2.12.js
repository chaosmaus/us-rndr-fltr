$(document).ready(function () {
  const getData = (options) => {
    axios
      .request(options)
      .then(function (response) {
        //console.log("Then checkpoint");
        //console.log(response.data);

        filterController(response.data);
      })
      .catch(function (error) {
        //console.error(error);
      });
  };

  const priceController = (parsedProperties) => {
    //console.log('entered Price Controller: ', parsedProperties )

    /*    $('.items').each((i, el) => {
      console.log('item each')
    }) */
    parsedProperties.forEach((element, index) => {
      //console.log(' element.id: ',  element.id)
      $(".item").each((i, el) => {
        if ($(el).find(".item_guesty-id").text() === element.id) {
          //console.log(' same id')
          let totalPrice = 0;
          console.log(`-------------${index}--------------`)
          element.datePrice.forEach((intraEl, i2) => {
            console.log(`night ${i2 + 1} price: `, intraEl.price)
            if(i2 + 1 < element.datePrice.length){
              totalPrice += intraEl.price;
            }
            
          });
          //console.log('id: ', element.id);
          //console.log('total price: ',totalPrice );
          let inputotal = totalPrice / (element.datePrice.length - 1)
          inputotal = inputotal + inputotal*0.154;
          $(el)
            .find(".per-night")
            .text(Math.ceil(inputotal));
          let procFee = Number($(el).find('.item_processing-fee').text());
          let cleanFee = Number($(el).find('.item_cleaning-fee').text());

          
          
          let finalTotal = Math.ceil(totalPrice + Math.ceil(totalPrice*0.154) + cleanFee );
          procFee = Math.ceil(finalTotal*procFee*0.01);
          finalTotal = finalTotal + procFee;

          console.log('cleanFee: ', cleanFee);
          console.log('procFee: ', Math.ceil(totalPrice*procFee*0.01));
          console.log('total without fees: ', totalPrice);
          console.log('----------------------------')
          $(el)
            .find('#totalPrice')
            .text(finalTotal);
        }
      });
    });
  };
/*
  function calculateTotal( price ){
    price = Math.ceil(price + price * 0.154);
    let procFee = PAYMENT PROCCESSING FEE ;
    let priceString = price.toString();

    if(priceString.length > 3){
      console.log('nights selected', Number($('#night').text()));
      console.log('price', price);
      console.log('price per night', Math.ceil(price/Number($('#night').text())))
        document.querySelector('#perNight').innerText = Math.ceil(price/(Number($('#night').text())));
        priceString = priceString.split('');
        priceString.splice(-3, 0, ',');
        priceString = priceString.join('');
        document.querySelector('#calcPrice').innerText = priceString;
    } else {
        document.querySelector('#calcPrice').innerText = price;
        document.querySelector('#perNight').innerText = Math.ceil(price/Number($('#night').text()));
    }
    let total = (price +  CLEANING FEE );



    //processing fee code

    procFee = procFee*total*0.01
    $('#processing-fee').text(Math.ceil(procFee))

    if(!($('#percentage').hasClass('hidden')))$('#percentage').addClass('hidden');

    $('#dollar-sign').removeClass('hidden');


    total = Math.ceil(total + (total* PAYMENT PROCCESSING FEE  *0.01))

     let totalString = total.toString();
    if(totalString.length > 3){
        totalString = totalString.split('');
        totalString.splice(-3, 0, ',');
        totalString = totalString.join('');
        document.querySelector('#total').innerText = totalString;
     } else {
         let total = (price + CLEANING FEE  );
        document.querySelector('#total').innerText = total;
    }
  }
*/
  const priceParser = (availableDates, propertiesData) => {
    //console.log("available dates: ", availableDates);
    //console.log("properties data: ", propertiesData);
    let parsedProperties = [];
    let datePrice = [];
    availableDates.forEach((element, index) => {
      propertiesData.forEach((el, i) => {
        if (element === el.listingId) {
          //we are in the same id on propertiesData
          datePrice.push({
            date: el.date,
            price: el.price,
          });
        }
      });

      parsedProperties.push({
        id: element,
        datePrice: datePrice,
      });
      datePrice = [];
      //console.log("nº: ", index);
      //console.log("property added: ", parsedProperties[index]);
    });
    priceController(parsedProperties);
  };

  const queryBuilder = (formData) => {
    let queryData = "";
    let guestyIds = "";
    let dates = {};

    //placeholder
    date = { startDate: formData.checkIn, endDate: formData.checkOut };

    $(".locations-cms_item").each((index, element) => {
      let guestyId = $(element).find(".location-field_guesty").text();
      if (index === 0) guestyIds += guestyId;
      else guestyIds += "," + guestyId;
    });

    //console.log("guestyIds: ", guestyIds);
    queryData =
      "?listingIds=" +
      guestyIds +
      `&startDate=${date.startDate}&endDate=${date.endDate}`;

    const options = {
      method: "GET",
      url: `https://guesty-bridge-restful-api.herokuapp.com/reservations${queryData}`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "cors",
      },
    };

    return options;
  };

  const filterController = (data) => {
    if (!$(".no-items_block").hasClass("hidden"))
      $(".no-items_block").addClass("hidden");
    let unavailableIds = data.unavailableDates;
    let availableDates = [];
    let guests = $("#guests").text();
    $(".item").each((index, element) => {
      let currentId = $(element).find(".item_guesty-id").text();
      if (unavailableIds.includes(currentId)) {
        if (!$(element).hasClass("hidden")) {
          $(element).addClass("hidden");
          $(".listings_wrapper").removeClass("loading");
          $(".loading-gif").addClass("hidden");
        }
      } else {
        availableDates.push(currentId);
      }

      let numGuests = Number($(element).find(".item_guests").text());
      //console.log('guests: ', guests);
      //console.log('numGuests: ', numGuests);
      if (guests > numGuests) {
        if (!$(element).hasClass("hidden")) {
          $(element).addClass("hidden");
          $(".listings_wrapper").removeClass("loading");
          if (!$(".loading-gif").hasClass("hidden"))
            $(".loading-gif").addClass("hidden");
          /* console.log("Listing removed: Too many guests."); */
        }
      }
    });

    priceParser(availableDates, data.availability);
    if ($(".item.hidden").length === $(".item").length)
      $(".no-items_block").removeClass("hidden");
    geoData = [];
    console.log("map update");
    //renderMap();
    localStorage.setItem("filter", "ready");
  };

  const filterSystem = (formData) => {
    let options = queryBuilder(formData);
    //console.log("options: ", options);
    getData(options);
  };

  //START MAP RENDER SCRIPT

  const locationsData = $(".locations-cms_item");
  let geoData = [];
  const locationsObject = {};

  const loadData = () => {
    $(".locations-cms_item").each((index, element) => {
      if ($(`.item:eq(${index})`).hasClass("hidden")) {
        //console.log("property unavailable");
      } else {
        geoData.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              Number($(element).find(".location-field_lang").text()),
              Number($(element).find(".location-field_lat").text()),
            ],
          },
          properties: {
            type: "fnac",
            guesty: $(element).find(".location-field_guesty").text(),
            title: $(element).find(".location-field_name").text(),
            //address: $(element).find(".location-field_address").text(),
            imgURL: $(element).find(".location-field_img").attr("src"),
            link: $(element).find(".location-field_link").attr("href"),
          },
        });
      }
    });
    return geoData;
  };

  const renderMap = () => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoidXJiYW5zdGF5YXBpIiwiYSI6ImNsNmd3a3ZmdzAyYTAzY3ByaDUzaXNwNXEifQ.-ffaDzlRzlzCymEFe4f3OA";
    let map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/urbanstayapi/cl6p3joim000k15prb1ia0v1t",
      center: [-97.6938589, 30.2776495],
      zoom: 12,
    });

    let stores = {
      features: loadData(),
      type: "FeatureCollection",
    };

    stores.features.forEach(function (store, i) {
      store.properties.id = i;
    });

    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 12,
        maxZoom: 15,
      });
    }

    function createPopUp(currentFeature) {
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0]) popUps[0].remove();

      const popup = new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          `<a href="${currentFeature.properties.link}" style="text-decoration: none;" ><h3>${currentFeature.properties.title}</h3><img loading="lazy" class="popup_img" alt src="${currentFeature.properties.imgURL}" ></a>`
        )
        .addTo(map);
    }

    function buildLocationList(stores) {
      for (let [i, store] of stores.features.entries()) {
        let listings = $("#listings");
        let listing = listings.find(".item");
        if (!listing.hasClass("hidden")) {
          listing[i].id = `listing-${store.properties.id}`;
          currentListing = listing[i];
          $(".title").each((index, element) => {
            element.id = `link-${index}`;
          });
          $(listing[i]).on("click", function () {
            for (let feature of stores.features) {
              if (this.id === `listing-${feature.properties.id}`) {
                flyToStore(feature);
                createPopUp(feature);
              }
            }
            let activeItem = document.getElementsByClassName("active");
            if (activeItem[0]) {
              activeItem[0].classList.remove("active");
            }
            this.classList.add("active");
          });
        }
      }
    }

    function duplicateCoordinateController(
      currentFeature,
      featuresObject,
      zoom,
      isFinalCluster
    ) {
      let oldCoord = [];
      let newCoord = [];
      let differentCoordCounts = 0;
      featuresObject.forEach((element, index) => {
        newCoord = element.geometry.coordinates;
        if (index === 0) {
          oldCoord = newCoord;
          return;
        }
        if (newCoord[0] === oldCoord[0] && newCoord[1] === oldCoord[1]) {
        } else {
          differentCoordCounts++;
        }
        oldCoord = newCoord;
      });
      if ((differentCoordCounts === 0) | isFinalCluster) {
        const popUps = document.getElementsByClassName("mapboxgl-popup");

        if (popUps[0]) popUps[0].remove();
        featuresObject.forEach((element, index) => {});

        const popup = new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(newCoord)
          .setHTML(
            ` <span id="cluster-pop-up" > </span>  `
          )
          .addTo(map);
        let popUp = document.getElementById("cluster-pop-up");
        featuresObject.forEach((element, index) => {
          popUp.insertAdjacentHTML(
            "afterend",
            `<a href="${element.properties.link}" style="display:flex; border: 1px solid #f0f0f0; justify-content: space-between; text-decoration: none;" class="popup-wrapper"><h4>${element.properties.title}</h4> <img loading="lazy" class="popup_img" alt src="${element.properties.imgURL}" ></a>`
          );
        });
      } else {
        console.log("map zoom level: ", map.getZoom());
      }
    }

    map.on("load", function () {
      map.addSource("locations", {
        type: "geojson",
        data: stores,
        cluster: true,
        clusterMaxZoom: 18,
        clusterRadius: 80,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#D1FAE5",
            100,
            "#f1f075",
            750,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            22,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "locations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 18,
        },
      });

      map.loadImage(
        "https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/62f81aef38a728ec53bd4b2b_House%20Icon%2050.png",
        function (error, image) {
          if (error) throw error;
          map.addImage("darty", image);
        }
      );

      map.loadImage(
        "https://uploads-ssl.webflow.com/62703dcda5e510755f5958e5/62f81aef38a728ec53bd4b2b_House%20Icon%2050.png",
        function (error, image) {
          if (error) throw error;
          map.addImage("fnac", image);
        }
      );

      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "locations",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "{type}",
        },
      });

      map.on("click", "clusters", function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });

        var clusterId = features[0].properties.cluster_id;
        map
          .getSource("locations")
          .getClusterExpansionZoom(clusterId, function (err, zoom) {
            let isFinalCluster = false;
            if (err) return;
            if (zoom > 17) {
              zoom = 17;
              isFinalCluster = true;
            }
            point_count = features[0].properties.point_count;
            clusterSource = map.getSource("locations");
            clusterSource.getClusterLeaves(
              clusterId,
              point_count,
              0,
              function (err, aFeatures) {
                duplicateCoordinateController(
                  features,
                  aFeatures,
                  zoom,
                  isFinalCluster
                );
              }
            );

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.on("click", "unclustered-point", function (e) {
        const popUps = document.getElementsByClassName("mapboxgl-popup");
        if (popUps[0]) popUps[0].remove();

        const popup = new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(e.features[0].geometry.coordinates)
          .setHTML(
            `
            <a style="text-decoration: none;" href="${e.features[0].properties.link}">
            <h3>${e.features[0].properties.title}</h3>
            <img loading="lazy" class="popup_img" alt src="${e.features[0].properties.imgURL}" >
            </a>
            `
          )
          .addTo(map);
      });

      // ------------- REFRESH MAP --------------- //
      /* 
      What I was doing before:
      - what I need is a initial run of the filter click
      - 
      
      */
     const filterInit = () => {
      let popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0]) popUps[0].remove();

      const checkAndRefreshMap = () => {
        if (localStorage.getItem("filter") === "ready") {
          stores = {
            features: loadData(),
            type: "FeatureCollection",
          };


          map.getSource("locations").setData(stores);
        } else {
          setTimeout(() => {
            checkAndRefreshMap();
          }, 500);
        }
      };

      checkAndRefreshMap();
     }
     filterInit();

      $(".submit-button").on("click", () => {
        let popUps = document.getElementsByClassName("mapboxgl-popup");
        if (popUps[0]) popUps[0].remove();

        const checkAndRefreshMap = () => {
          if (localStorage.getItem("filter") === "ready") {
            stores = {
              features: loadData(),
              type: "FeatureCollection",
            };


            map.getSource("locations").setData(stores);
          } else {
            setTimeout(() => {
              checkAndRefreshMap();
            }, 500);
          }
        };

        checkAndRefreshMap();
      });

      map.on("mouseenter", "clusters", function () {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", function () {
        map.getCanvas().style.cursor = "";
      });

      map.on("style.load", function () {
        map.on("click", mouseClick);
      });

      buildLocationList(stores);
    });
  };

/*   const mapInitializer = () => {
    if (localStorage.getItem("filter") === "ready") {
      setTimeout(() => {
        renderMap();
      }, 500);
    } else {
      setTimeout(() => {
        mapInitializer();
      }, 500);
    }
  };

  localStorage.setItem("filter", "");
  mapInitializer(); */
  localStorage.setItem("filter", "");
  renderMap();
  //initialize

  // CLICK BUTTON LISTENER
  $(".submit-button").on("click", () => {
    localStorage.setItem("filter", "");
    $(".item").removeClass("hidden");
    $(".listings_wrapper").addClass("loading");
    $(".loading-gif").removeClass("hidden");

    let checkIn = $("#check-in").text();
    let checkOut = $("#checkout").text();

    filterSystem({ checkIn, checkOut });
  });
});
