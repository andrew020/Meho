import React from 'react';
import {
    Dimensions,
} from 'react-native';

var Global = {
    mehoBlue: '#fd3f36',
    mehoWhite: '#ffffff',
    mehoGrey: '#ecebf2',
    mehoBorderGrey: '#d8d8db',
    mehoRed: '#b7242a',
    mehoGreen: '#2e9b24',
    mehoMainTextColor: '#555555',
    mehoMainTextFontSize: 15,
    mehoSecondTextColor: '#6c6c6c',
    mehoSecondTextFontSize: 13.5,

    domain: "https://www.meho.shop",
    apiCategoryShop: "InfSetShopApi",
    apiCategoryPublic: "InfPublishApi",
    apiCategoryMobile: "InfMobileApi",
};

function formatRequestURL(domainString, apiCategory, api) {
    if (domainString === null || apiCategory === null || api === null) {
        return "";
    }

    while (domainString.length > 0 && (domainString.charAt(domainString.length - 1) === '/')) {
        domainString = domainString.substr(0, domainString.length - 1);
    }
    if (domainString.length == 0) {
        return "";
    }

    while (apiCategory.length > 0 && (apiCategory.charAt(apiCategory.length - 1) === '/')) {
        apiCategory = apiCategory.substr(0, apiCategory.length - 1);
    }
    while (apiCategory.length > 0 && (apiCategory.charAt(0) === '/')) {
        apiCategory = apiCategory.substr(1, apiCategory.length - 1);
    }
    if (apiCategory.length == 0) {
        return "";
    }
    
    domainString += ("/" + apiCategory);

    while (api.length > 0 && (api.charAt(api.length - 1) === '/')) {
        api = api.substr(0, api.length - 1);
    }
    while (api.length > 0 && (api.charAt(0) === '/')) {
        api = api.substr(1, api.length - 1);
    }
    if (api.length == 0) {
        return "";
    }
    
    domainString += ("/" + api);

    return domainString;
}

function screenWidth() {
    var width = Dimensions.get('window').width;
    return width;
}

function screenHeight() {
    var width = Dimensions.get('window').height;
    return width;
}

function getSmallImageURL(imageURL) {
    var endindex = imageURL.indexOf("?imageView2/");
    if (endindex >= 0) {
        imageURL = imageURL.substr(0, endindex);
    }
    return imageURL + "?imageView2/1/w/200/h/200/q/80";
}

function getMedialImageURL(imageURL) {
    var endindex = imageURL.indexOf("?imageView2/");
    if (endindex >= 0) {
        imageURL = imageURL.substr(0, endindex);
    }
    return imageURL + "?imageView2/1/w/640/h/640/q/80";
}

function convertImagesURLWithMedial(images) {
    var newImages = [];
    for (var index = 0; index < images.length; index++) {
        var imageURL = images[index];
        if (imageURL.startsWith("http")) {
            imageURL = getMedialImageURL(imageURL);
        }
        newImages.push(imageURL);
    }
    return newImages;
}

export default {
    global: Global,
    screenWidth: screenWidth.bind(),
    screenHeight: screenHeight.bind(),
    getSmallImageURL: getSmallImageURL.bind(),
    getMedialImageURL: getMedialImageURL.bind(),
    convertImagesURLWithMedial: convertImagesURLWithMedial.bind(),
    formatRequestURL: formatRequestURL.bind(),
};