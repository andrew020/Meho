import React, { Component } from 'react';
import Constants from "./Constants";
import {
    FlatList,
    StyleSheet,
    Image,
    Text,
    View,
    Alert,
    Dimensions,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import DataCenter from './data';
import { CachedImage } from "react-native-img-cache";

export default class ImageTemplate extends Component {

    constructor(props) {
        super(props)
        this.state = {
            list: [],
        }
    }

    componentWillMount() {
        DataCenter.getTemplateList((sucess, results) => {
            if (sucess) {
                this.setState({ list: results });
            }
            else {
                Alert.alert(
                    "Meho",
                    results
                );
            }
        });
    }

    _onPressItem = (item, index) => {
        var data = this.state.list[index];
        Alert.alert(
            '模版',
            '要使用 “' + item['template_name'] + '” 模版吗?',
            [
                { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                {
                    text: '确定', onPress: () => {
                        const { navigation } = this.props;
                        navigation.goBack();
                        navigation.state.params.select({ data: item })
                    }
                },
            ],
            { cancelable: false }
        )
    };

    render() {
        return (
            <View>
                <StatusBar barStyle='light-content' />
                <FlatList style={styles.flatList}
                    numColumns={2}
                    data={this.state.list}
                    renderItem={this.renderTemplateItem.bind(this)}
                    keyExtractor={(item, index) => item['id']}
                />
            </View>
        )
    };

    renderTemplateItem = ({ item }) => {
        const { params } = this.props.navigation.state;
        const text = params ? params.text : null;
        const price = params ? params.price : null;
        return (<TouchableOpacity onPress={() => this._onPressItem(item)}>
            <View style={styles.flatItem}>
                <CachedImage style={styles.image}
                    source={{
                        uri: item['cover_image']
                    }}
                    resizeMode="contain"
                />
                <View style={styles.summaryContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label} numberOfLines={1}>
                            {text}
                        </Text>
                        <Text style={styles.priceLabel} numberOfLines={1}>
                            {"抢购价 ¥" + price}
                        </Text>
                    </View>
                    <CachedImage style={styles.icon}
                        source={{
                            uri: item['tag_image']
                        }}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </TouchableOpacity>
        )
    };
}

const styles = StyleSheet.create({
    flatList: {
        padding: 5,
        backgroundColor: Constants.global.mehoWhite,
    },
    flatItem: {
        borderColor: Constants.global.mehoGrey,
        borderWidth: 1,
        margin: 5,
        padding: 10,
        width: (Dimensions.get('window').width - 30) / 2,
        height: (Dimensions.get('window').width - 30) / 2 + 60,
    },
    summaryContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelContainer: {
        flex: 1,
        height: 30
    },
    image: {
        resizeMode: 'contain',
        //backgroundColor: constants.mehoGrey,
        flex: 1,
    },
    label: {
        fontSize: Constants.global.mehoSecondTextFontSize,
        color: Constants.global.mehoMainTextColor,
    },
    priceLabel: {
        fontSize: Constants.global.mehoMainTextFontSize,
        color: Constants.global.mehoSecondTextColor,
        marginTop: 5,
    },
    priceRedLabel: {
        fontSize: Constants.global.mehoMainTextFontSize,
        color: Constants.global.mehoRed,
        fontWeight: 'bold',
    },
    icon: {
        width: 40,
        height: 40,
        //backgroundColor: Constants.global.mehoGrey,
        marginLeft: 5,
    }
})
