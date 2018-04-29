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
};

function screenWidth() {
    var width = Dimensions.get('window').width;
    return width;
}

function screenHeight() {
    var width = Dimensions.get('window').height;
    return width;
}

export default {
    global: Global,
    screenWidth: screenWidth.bind(),
    screenHeight: screenHeight.bind(),
};