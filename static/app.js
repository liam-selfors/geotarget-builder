let selectedRegions = [];
let selectedDmas = [];
let data = {
    "placementNames": [],
    "geographies": []
};
let csv = "Placement Name,Geographies";
var dmaSearchValue = "";

function filterDmas() {
    dmaSearchValue = d3.select('#dma-search').property("value");
    dmaMap.removeLayer(geojsonDma);
    geojsonDma = L.geoJson([dmaData], {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(dmaMap);
}

function loadRegionTable() {
    let tbody = d3.select("tbody");
    tbody.html("");
    selectedRegions.sort().forEach((name) => {
        let tr = tbody.append("tr");
        let td1 = tr.append("td");
        td1.text("Region");
        let td2 = tr.append("td");
        td2.text(name);
    });
    selectedDmas.sort().forEach((name) => {
        let tr = tbody.append("tr");
        let td1 = tr.append("td");
        td1.text("DMA");
        let td2 = tr.append("td");
        td2.text(name);
    });
}

var regionMap = L.map('region', {
    maxBounds: L.latLngBounds(L.latLng(40, -96), L.latLng(40, -96)),
}).setView([40, -96], 4);

regionMap.dragging.disable();
regionMap.zoomControl.disable();
regionMap.boxZoom.disable();
regionMap.touchZoom.disable();
regionMap.doubleClickZoom.disable();
regionMap.scrollWheelZoom.disable();

var dmaMap = L.map('dma', {
    maxBounds: L.latLngBounds(L.latLng(-3, -30), L.latLng(28, 30)),
    minZoom: 4,
    maxZoom: 6,
}).setView([12, 0], 4);

dmaMap.doubleClickZoom.disable();

L.geoJson(statesData).addTo(regionMap);
L.geoJson(provinceData).addTo(regionMap);

function style(feature) {
    var currentDmaName = feature.properties.dma_name
    if (currentDmaName) {
        if (selectedDmas.includes(currentDmaName)) {
            return {
                fillColor: 'green',
                weight: 2,
                opacity: 1,
                color: 'gray',
                fillOpacity: 0.5
            };
        } else if (currentDmaName.toLowerCase().includes(dmaSearchValue.toLowerCase()) && dmaSearchValue) {
            return {
                fillColor: 'yellow',
                weight: 2,
                opacity: 1,
                color: 'gray',
                fillOpacity: 0.5
            };
        } else {
            return {
                fillColor: 'lightgray',
                weight: 2,
                opacity: 1,
                color: 'gray',
                fillOpacity: 0.5
            };
        }
    } else {
        return {
            fillColor: 'lightgray',
            weight: 2,
            opacity: 1,
            color: 'gray',
            fillOpacity: 0.5
        };
    }
}

L.geoJson(statesData, {style: style}).addTo(regionMap);

function highlightFeature(e) {
    d3.select('#warning-geo').text("")
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        fillOpacity: 0.5
    });

    var layer = e.target;

    var name = layer.feature.properties.name
    if (!name) { name = layer.feature.properties.prov_name_en }
    if (!name) { name = layer.feature.properties.dma_name; locCat = "d" }

    var hovering = d3.select("#hovering");
    hovering.text(name)
}

function resetHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: 'gray',
        fillOpacity: 0.5
    });

    var hovering = d3.select("#hovering");
    hovering.text("")
}

function toggleSelection(e) {
    var layer = e.target;

    var name = layer.feature.properties.name
    var locCat = "r"
    if (!name) { name = layer.feature.properties.prov_name_en }
    if (!name) { name = layer.feature.properties.dma_name; locCat = "d" }

    if (layer.options.fillColor == "green") {
        layer.setStyle({
            fillColor: 'lightgray',
            weight: 5,
            color: '#666',
            fillOpacity: 0.5
        });
        if (locCat == "r") {
            selectedRegions.pop(name);
        } else {
            selectedDmas.pop(name);
        }
        loadRegionTable();
    } else {
        layer.setStyle({
            fillColor: 'green',
            weight: 2,
            color: 'gray',
            fillOpacity: 0.5
        });
        if (locCat == "r") {
            selectedRegions.push(name);
        } else {
            selectedDmas.push(name);
        }
        loadRegionTable();
    }

    layer.bringToFront();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: toggleSelection
    });
}

geojsonRegion = L.geoJson([statesData, provinceData], {
    style: style,
    onEachFeature: onEachFeature
}).addTo(regionMap);

geojsonDma = L.geoJson([dmaData], {
    style: style,
    onEachFeature: onEachFeature
}).addTo(dmaMap);

function clearTable() {
    d3.select('#warning').text("")
    selectedRegions = [];
    selectedDmas = [];
    loadRegionTable();
    regionMap.removeLayer(geojsonRegion);
    geojsonRegion = L.geoJson([statesData, provinceData], {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(regionMap);
    dmaMap.removeLayer(geojsonDma);
    geojsonDma = L.geoJson([dmaData], {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(dmaMap);
}

function placementUpdate() {
    d3.select('#warning-placement').text("")
}

function addRow() {
    var p = d3.select("#placement-name").property("value");
    if (selectedRegions.length + selectedDmas.length == 0) {
        d3.select('#warning-geo').text("Please select a geography.");
    } else if (!p) {
        d3.select('#warning-placement').text("Please enter a unique placement name.");
    } else if (data.placementNames.includes(p)) {
        d3.select('#warning-placement').text("Placement name already exists.")
    } else {
        let reportTbody = d3.select('#report > tbody');
        let reportTr = reportTbody.append("tr");
        let reportTd1 = reportTr.append("td");
        reportTd1.text(p);
        let reportTd2 = reportTr.append("td");
        reportTd2.text(selectedRegions.join(', ') + ", " + selectedDmas.join(', '));
        data.placementNames.push(p);
        data.geographies.push(selectedRegions.join(', ') + ", " + selectedDmas.join(', '));

        csv = csv + "\n" + d3.select("#placement-name").property("value") + ",\"" + selectedRegions.join('_') + "_" + selectedDmas.join('_') + '"';
    }
}

const exportCsv = async function () {
    let placementName = d3.select("#placement-name").property("value")
    let warning = d3.select("#placement-name");
    warning.text("");

    // Create a blob
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    // Create a link to download it
    var pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', 'export.csv');
    pom.click();

    clearTable()
}