import React, { Component } from 'react';
let constants = require('./Constants');
import {
    FlatList,
    StyleSheet,
    Image,
    Text,
    View,
    Dimensions,
} from 'react-native';

export default class TextTemplate extends Component {
    render() {
        return (
            <FlatList style={styles.flatList}
                data={[
                    { key: "1" },
                    { key: "2" },
                    { key: "3" },
                    { key: "4" },
                    { key: "5" },
                    { key: "6" },
                ]}
                renderItem={(item) =>
                    <View style={styles.item}>
                        <Text style={styles.text}>剁手</Text>
                    </View>
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    flatList: {
        backgroundColor: constants.mehoWhite,
    },
    item: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: constants.mehoGrey,
    },
    text: {
        fontSize: constants.mehoSecondTextFontSize,
        color: constants.mehoMainTextColor,
    }
})