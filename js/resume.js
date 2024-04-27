const locationsPath = "../db/provinces_cities_municipalities_and_barangays.json";
const countryCodePath = "../db/country_codes.json";
const jobsDbPath = "../db/jobs.json";

let countryCode,
    jobs,
    currentProvinceSelected,
    currentCitySelected,
    provinces = [];

let formField = document.getElementById("main-form"),
    countryCodeInputField = document.getElementById("country-code"),
    provinceInputField = document.getElementById("state-province"),
    cityInputField = document.getElementById("city"),
    barangayInputField = document.getElementById("barangay"),
    jobsInputField = document.getElementById("position");

/**
 * Slugify a string: converts a string to lowercase and convert spaces to dashes
 * @param {string} inputStr - the string to be slugified
 * @returns {string} Returns the slugified input string
 */
function slugify(inputStr) {
    if (!inputStr) {
        return "";
    }

    let slug = inputStr.toLowerCase().trim();
    // replace accents:
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // replace invalid chars with space:
    slug = slug.replace(/[^a-z0-9\s-]/g, " ").trim();
    // replace multiple spaces or hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, "-");

    return slug;
}

/** Fetch local JSON data */
async function fetchData() {
    // Fetch PH provinces, municipalities, and barangay JSON data
    const locationsDbResponse = await fetch(locationsPath);
    const locationsObj = await locationsDbResponse.json();

    // Fetch country codes JSON data
    const countryCodeDbResponse = await fetch(countryCodePath);
    countryCode = await countryCodeDbResponse.json();

    // Fetch list of available jobs
    const jobsDbResponse = await fetch(jobsDbPath);
    jobs = await jobsDbResponse.json();

    // Set values for select options
    for (let i = 0; i < countryCode.length; i++) {
        let countryCodeOption = new Option(
            `${countryCode[i].dial_code} (${countryCode[i].code})`,
            slugify(countryCode[i].dial_code)
        );
        countryCodeInputField.add(countryCodeOption);
        if (countryCode[i].code === "PH") {
            countryCodeInputField.selectedIndex = i;
        }
    }

    jobs.forEach((job) => {
        jobsInputField.add(new Option(job, slugify(job)));
    });

    Object.keys(locationsObj).forEach((region) => {
        if (region == "NCR") {
            let ncrObj = {
                "name": "METRO MANILA",
                "municipality_list": {}
            };
            let municipalityObj = {};

            let ncrDistricts = Object.keys(locationsObj[region]["province_list"]);
            ncrDistricts.forEach((district) => {
                let districtObj = locationsObj[region]["province_list"][district];
                let cities = Object.keys(districtObj["municipality_list"]);
                cities.forEach((city) => {
                    municipalityObj[city] = districtObj["municipality_list"][city];
                })
            })
            ncrObj["municipality_list"] = municipalityObj;

            provinces.push(ncrObj);
        } else {
            let regionArr = locationsObj[region]["province_list"];
            Object.keys(regionArr).forEach((province) => {
                let provinceObj = {
                    "name": province,
                    "municipality_list": {},
                };
                provinceObj.municipality_list = locationsObj[region]["province_list"][province]["municipality_list"];
                provinces.push(provinceObj);
            });
        }
    });

    provinces.forEach((province) => {
        provinceInputField.add(new Option(province.name, slugify(province.name)));
    });

    // Based on the default selected option in State/Province field
    currentProvinceSelected = provinces[0].name;
    let currentMunicipalities = Object.keys(provinces[0].municipality_list);
    currentMunicipalities.forEach((municipality) => {
        cityInputField.add(new Option(municipality, slugify(municipality)));
    })

    currentCitySelected = Object.keys(provinces[0].municipality_list)[0];

    let currentBarangays = provinces[0].municipality_list[currentMunicipalities[0]].barangay_list;
    currentBarangays.forEach((barangay) => {
        barangayInputField.add(new Option(barangay, slugify(barangay)));
    })
}

fetchData()


formField.addEventListener("submit", submitConfirm);
provinceInputField.addEventListener("change", changeCityOptions)
cityInputField.addEventListener("change", (e) => {
    let selectedCity = e.target.options[e.target.selectedIndex].text;

    let provinceIdx;
    provinces.forEach((obj) => {
        if (obj.name === currentProvinceSelected) {
            provinceIdx = provinces.indexOf(obj);
            return provinceIdx;
        }
    });

    let newBarangayOptions = provinces[provinceIdx].municipality_list[selectedCity].barangay_list;
    barangayInputField.innerHTML = '';
    newBarangayOptions.forEach((barangay) => {
        barangayInputField.add(new Option(barangay, slugify(barangay)));
    });
});


function changeCityOptions(e) {
    let selectedProvince = e.target.options[e.target.selectedIndex].text;
    currentProvinceSelected = selectedProvince;

    let provinceIdx;
    provinces.forEach((obj) => {
        if (obj.name === selectedProvince) {
            provinceIdx = provinces.indexOf(obj);
            return provinceIdx;
        }
    })

    let newCityOptions = Object.keys(provinces[provinceIdx].municipality_list);

    cityInputField.innerHTML = '';
    newCityOptions.forEach((city) => {
        cityInputField.add(new Option(city, slugify(city)));
    })

    currentCitySelected = newCityOptions[0];

    changeBarangayOptions(currentCitySelected);
}

function changeBarangayOptions(selectedCity) {
    let provinceIdx;
    provinces.forEach((obj) => {
        if (obj.name === currentProvinceSelected) {
            provinceIdx = provinces.indexOf(obj);
            return provinceIdx;
        }
    })

    let newBarangayOptions = provinces[provinceIdx].municipality_list[selectedCity].barangay_list;
    barangayInputField.innerHTML = '';
    newBarangayOptions.forEach((barangay) => {
        barangayInputField.add(new Option(barangay, slugify(barangay)));
    })
}

function submitConfirm(eventObj) {
    eventObj.preventDefault();
    alert("Your application has been successfully submitted");
    formField.reset();
    window.location.href = "index.html";
}
