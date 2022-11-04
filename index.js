(async () => {
    //import dom
    const allTypeList = document.getElementById("school-lists");
    const detailsView = document.getElementById("school-details");
    // variables
    let currentClickDiv = null;
    const colors = ["#ef994d", "#2e994d", "#f27265", "#51bbd6", "#f28cb1"];
    const private = ["==", ["get", "TYPE_SPECIFIC"], "PRIVATE"];
    const archdiocese = ["==", ["get", "TYPE_SPECIFIC"], "ARCHDIOCESE"];
    const district = ["==", ["get", "TYPE_SPECIFIC"], "DISTRICT"];
    const charter = ["==", ["get", "TYPE_SPECIFIC"], "CHARTER"];
    const contracted = ["==", ["get", "TYPE_SPECIFIC"], "CONTRACTED"];

    // customClusterMarker func
    function customClusterMarker(props) {
        const counts = [
            props.private,
            props.archdiocese,
            props.district,
            props.charter,
            props.contracted,
        ];

        let total = 0;
        for (const count of counts) {
            total += count;
        }

        let img = document.createElement("img");
        let html = document.createElement("div");
        img.classList.add("marker-image");

        html.classList.add("marker-cluster-group");
        img.src = "./assets/book-icon.svg";
        html.setAttribute("data-total", total);

        html.appendChild(img);

        const el = document.createElement("div");
        el.appendChild(html);
        return el.firstChild;
    }

    // initalize map
    const map = new mapboxgl.Map({
        accessToken: "YOUR_ACCESS_TOKEN",
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 5,
        center: [-75.1634134086327, 40.0595120027579],
    });

    // map control (zoom in/out)
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // fetch goejson
    const res = await fetch("./Schools.geojson");
    const data = await res.json();

    // side bar indication
    const schoolTypes = {};
    data.features.forEach((school) => {
        if (schoolTypes[school.properties.TYPE_SPECIFIC] === undefined) {
            schoolTypes[school.properties.TYPE_SPECIFIC] = 1;
        } else schoolTypes[school.properties.TYPE_SPECIFIC] += 1;
    });

    Object.entries(schoolTypes).forEach(([key, value], i) => {
        const listItem = document.createElement("li");
        const list = document.createElement("p");
        const span = document.createElement("span");

        if (key === "PRIVATE") {
            list.textContent = `${key}`;
            span.textContent = `${value}`;
            list.style.setProperty("--school-color", colors[i]);
            list.style.setProperty(
                "--school-color-url",
                `url('./assets/dollar-icon.svg')`
            );
        } else if (key === "ARCHDIOCESE") {
            list.textContent = `${key}`;
            span.textContent = `${value}`;
            list.style.setProperty("--school-color", colors[i]);
            list.style.setProperty(
                "--school-icon-url",
                `url('./assets/archdiocese-icon.svg')`
            );
        } else if (key === "DISTRICT") {
            list.textContent = `${key}`;
            span.textContent = `${value}`;
            list.style.setProperty("--school-color", colors[i]);
            list.style.setProperty(
                "--school-icon-url",
                `url('./assets/school-fav.svg')`
            );
        } else if (key === "CHARTER") {
            list.textContent = `${key}`;
            span.textContent = `${value}`;
            list.style.setProperty("--school-color", colors[i]);
            list.style.setProperty(
                "--school-icon-url",
                `url('./assets/charter-icon.svg')`
            );
        } else if (key === "CONTRACTED") {
            list.textContent = `${key}`;
            span.textContent = `${value}`;
            list.style.setProperty("--school-color", colors[i]);
            list.style.setProperty(
                "--school-icon-url",
                `url('./assets/contact-icon.svg')`
            );
        }

        listItem.appendChild(list);
        listItem.appendChild(span);

        allTypeList.children[0].appendChild(listItem);
    });

    // map on load
    map.on("load", () => {
        // add a clustered GeoJSON source for a sample set of school
        map.addSource("school-cluster", {
            type: "geojson",
            data: data,
            cluster: true,
            clusterRadius: 19,
            clusterProperties: {
                private: ["+", ["case", private, 1, 0]],
                archdiocese: ["+", ["case", archdiocese, 1, 0]],
                district: ["+", ["case", district, 1, 0]],
                charter: ["+", ["case", charter, 1, 0]],
                contracted: ["+", ["case", contracted, 1, 0]],
            },
        });

        map.addLayer({
            id: "school_count_label",
            type: "symbol",
            source: "school-cluster",
        });

        const markers = {};
        let markersOnScreen = {};

        function updateMarkers() {
            const newMarkers = {};
            const features = map.querySourceFeatures("school-cluster");

            for (const feature of features) {
                const coords = feature.geometry.coordinates;
                const props = feature.properties;
                if (!props.cluster) continue;
                const id = props.cluster_id;

                let marker = markers[id];
                if (!marker) {
                    const el = customClusterMarker(props);
                    marker = markers[id] = new mapboxgl.Marker({
                        element: el,
                    }).setLngLat(coords);
                }
                newMarkers[id] = marker;

                if (!markersOnScreen[id]) marker.addTo(map);
            }

            for (const id in markersOnScreen) {
                if (!newMarkers[id]) markersOnScreen[id].remove();
            }
            markersOnScreen = newMarkers;
        }

        // after load, its reander every frame
        map.on("render", () => {
            if (!map.isSourceLoaded("school-cluster")) return;

            updateMarkers();
        });

        //fit bound
        const bounds = new mapboxgl.LngLatBounds(
            data.features[0].geometry.coordinates,
            data.features[0].geometry.coordinates
        );

        for (const d of data.features) {
            bounds.extend(d.geometry.coordinates);
        }

        map.fitBounds(bounds, {
            padding: 300,
        });
        // create map marker
        data.features.forEach((d, index) => {
            const schoolCoord = d.geometry.coordinates;
            const schoolType = d.properties.TYPE_SPECIFIC;
            const MarkerDiv = document.createElement("div");

            if (schoolType === "PRIVATE") {
                MarkerDiv.classList.add("map-marker");
                MarkerDiv.style.setProperty("--school-color", colors[0]);
                MarkerDiv.style.setProperty(
                    "--school-icon",
                    `url('./assets/dollar-icon.svg')`
                );
            } else if (schoolType === "ARCHDIOCESE") {
                MarkerDiv.classList.add("map-marker");
                MarkerDiv.style.setProperty("--school-color", colors[1]);
                MarkerDiv.style.setProperty(
                    "--school-icon",
                    `url('./assets/archdiocese-icon.svg')`
                );
            } else if (schoolType === "DISTRICT") {
                MarkerDiv.classList.add("map-marker");
                MarkerDiv.style.setProperty("--school-color", colors[2]);
                MarkerDiv.style.setProperty(
                    "--school-icon",
                    `url('./assets/school-icon.svg')`
                );
            } else if (schoolType === "CHARTER") {
                MarkerDiv.classList.add("map-marker");
                MarkerDiv.style.setProperty("--school-color", colors[3]);
                MarkerDiv.style.setProperty(
                    "--school-icon",
                    `url('./assets/charter-icon.svg')`
                );
            } else if (schoolType === "CONTRACTED") {
                MarkerDiv.classList.add("map-marker");
                MarkerDiv.style.setProperty("--school-color", colors[4]);
                MarkerDiv.style.setProperty(
                    "--school-icon",
                    `url('./assets/contact-icon.svg')`
                );
            }

            // onclick to fly
            MarkerDiv.onclick = function () {
                if (currentClickDiv != null) {
                    currentClickDiv.style.border = "1px solid black";
                }
                // style border marker
                MarkerDiv.style.border = "2px solid red";

                map.flyTo({
                    center: schoolCoord,
                    essential: true,
                    zoom: 15,
                    speed: 0.8,
                });

                // show details
                detailsView.style.transform = "translateX(-10px)";
                // insert school informations
                // school name
                detailsView.children[0].textContent = `${d.properties.SCHOOL_NAME.toLowerCase()}`;
                // school address
                detailsView.children[1].children[1].textContent = `${
                    d.properties.STREET_ADDRESS || "N/A"
                }`;
                // zip code
                detailsView.children[2].children[1].textContent = `${
                    d.properties.ZIP_CODE || "N/A"
                }`;
                // phone number
                detailsView.children[3].children[1].textContent = `${
                    d.properties.PHONE_NUMBER || "N/A"
                }`;
                // grade level
                detailsView.children[4].children[1].textContent = `${
                    d.properties.GRADE_LEVEL || "N/A"
                }`;
                // type
                detailsView.children[5].children[1].textContent = `${
                    d.properties.TYPE_SPECIFIC || "N/A"
                }`;

                // save last click div
                currentClickDiv = MarkerDiv;
            };

            new mapboxgl.Marker(MarkerDiv).setLngLat(schoolCoord).addTo(map);
        });
    });
})();
