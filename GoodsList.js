import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, Alert, TouchableWithoutFeedback } from 'react-native';
import DataCenter from './data';
import constants from "./Constants";
import * as wechat from 'react-native-wechat'
import { sharePictures } from 'react-native-share-local'
import { CachedImage } from "react-native-img-cache";

export default class GoodsList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userName: '',
            userLabel: '',
            userAvatar: '',
            datas: [],
            isFetching: false,
            pageIndex: 1,
            pageSize: 20,
        }
        this.laodingMore = false
    }

    static navigationOptions = {
        title: '首页',
        header: null,
    };

    componentDidMount() {
        wechat.registerApp('wx1f5bd712a4439fef');

        this._getUser();
    }

    _getUser = () => {
        DataCenter.checkUser((id, name, label, avatar) => {
            if (!id) {
                this.props.navigation.navigate('LoginPage', { doLogin: this._getUser });
            }
            else {
                this.setState({
                    userName: name,
                    userLabel: label,
                    userAvatar: avatar,
                }, () => {
                    this._onRefresh();
                });
            }
        });
    }

    _onRefresh = () => {
        if (this.laodingMore) {
            return;
        }
        this.setState({
            isFetching: true,
        }, () => {
            DataCenter.getGoodsList(1, this.state.pageSize, (results, msg) => {
                if (results && results.length) {
                    this.setState({
                        pageIndex: 2,
                        isFetching: false,
                        datas: results,
                    });
                }

                if (msg && msg.length) {
                    this.setState({
                        isFetching: false,
                    }, () => {
                        Alert.alert(
                            "商品",
                            msg,
                        );
                    });
                }
            });
        });
    }

    _OnLoadMore = () => {
        if (this.laodingMore || this.state.isFetching) {
            return;
        }
        this.laodingMore = true;
        DataCenter.getGoodsList(this.state.pageIndex, this.state.pageSize, (results, msg) => {
            if (results && results.length) {
                this.setState(
                    {
                        pageIndex: this.state.pageIndex + 1,
                        datas: this.state.datas.concat(results),
                    },
                    () => {
                        this.laodingMore = true;
                    }
                );
            }

            if (msg && msg.length) {
                Alert(
                    "商品",
                    msg,
                );
            }
        });
    }

    _goToEdit = (item) => {
        var images = [];
        for (var index = 0; index < item['images'].length; index++) {
            var imageInfo = item['images'][index];

            var imageItem = {};
            imageItem['key'] = index;
            imageItem['imageString'] = imageInfo;
            imageItem['imageBase64'] = null;
            imageItem['selected'] = true;

            images.push(imageItem);
        }

        this.props.navigation.navigate(
            'EditContent',
            {
                goodsID: item['id'],
                title: item['name'],
                price: item['price'],
                description: item['description'],
                datas: images,
            }
        )
    }

    _sharing = (item) => {
        var option = {
            title: item['description'],
            imagesUrl: item['images'],
            callback: (error) => {
                if (!error) {
                    alert("这是回调方法")
                }
            }
        }
        sharePictures(option);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <CachedImage style={styles.headerImage} source={
                        this.state.userAvatar ? { uri: this.state.userAvatar } : require('./img/LOGO.png')
                    }
                    />
                    <View style={styles.nameContainer}>
                        <Text style={styles.headerName}>
                            {this.state.userName ? this.state.userName : ''}
                        </Text>
                        <Text style={styles.headerLabel}>
                            {this.state.userLabel ? this.state.userLabel : ''}
                        </Text>
                    </View>
                </View>
                <FlatList style={styles.list}
                    data={this.state.datas}
                    renderItem={this.renderGoodsItem.bind(this)}
                    refreshing={this.state.isFetching}
                    onRefresh={() => {
                        this._onRefresh();
                    }}
                    onEndReached={() => {
                        this._OnLoadMore();
                    }}
                    onEndReachedThreshold={0.05}
                    keyExtractor={(item, index) => item.id}
                />
            </View>
        );
    }

    _keyExtractor = (item, index) => item;

    renderGoodsItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => this._goToEdit(item)} activeOpacity={0.9}>
                <View style={goodsStyle.container}>
                    <FlatList horizontal={true}
                        data={item['images']}
                        renderItem={(imageItem) =>
                            <TouchableWithoutFeedback>
                                <CachedImage
                                    style={goodsStyle.itemImage}
                                    source={{
                                        uri: imageItem.item
                                    }}
                                    height={(constants.screenWidth() - 73) / 4}
                                    width={(constants.screenWidth() - 73) / 4}
                                />
                            </TouchableWithoutFeedback>
                        }
                        ItemSeparatorComponent={() => <View style={goodsStyle.itemSeparator} />}
                        keyExtractor={this._keyExtractor}
                    />
                    <View style={goodsStyle.infoContainer}>
                        <View style={goodsStyle.textContainer}>
                            <Text style={goodsStyle.titleText}>{item['name']}</Text>
                            <Text style={goodsStyle.labelText}>{item['description']}</Text>
                        </View>
                        <TouchableOpacity style={goodsStyle.button}
                            onPress={() => this._sharing(item)}
                        >
                            <Text style={goodsStyle.buttonText}>分享朋友圈</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const goodsStyle = StyleSheet.create({
    container: {
        backgroundColor: constants.global.mehoWhite,
        borderColor: constants.global.mehoBorderGrey,
        borderWidth: 1,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
    },
    itemImage: {
        backgroundColor: constants.global.mehoGrey,
        // height: 80,
        // width: 80,
    },
    itemSeparator: {
        width: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'space-around',
    },
    titleText: {
        fontSize: constants.global.mehoMainTextFontSize,
        fontWeight: 'bold',
        color: constants.global.mehoMainTextColor,
    },
    labelText: {
        marginTop: 5,
        fontSize: constants.global.mehoSecondTextFontSize,
        color: constants.global.mehoSecondTextColor,
    },
    button: {
        backgroundColor: constants.global.mehoBlue,
        padding: 7
    },
    buttonText: {
        fontSize: constants.global.mehoSecondTextFontSize,
        color: constants.global.mehoWhite,
    },
})

const styles = StyleSheet.create({
    container: {
        backgroundColor: constants.global.mehoGrey,
        flex: 1,
        alignItems: 'stretch'
    },
    headerContainer: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: constants.global.mehoBlue,
        height: 150,
    },
    headerImage: {
        height: 50,
        width: 50,
        marginLeft: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: constants.global.mehoWhite
    },
    nameContainer: {
        marginLeft: 10,
        flex: 0,
        flexDirection: 'column',
    },
    headerName: {
        fontWeight: 'bold',
        fontSize: constants.global.mehoMainTextFontSize,
        color: constants.global.mehoWhite,
    },
    headerLabel: {
        marginTop: 8,
        fontSize: constants.global.mehoSecondTextFontSize,
        color: constants.global.mehoWhite,
    },
    list: {
        marginTop: -30,
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
})
