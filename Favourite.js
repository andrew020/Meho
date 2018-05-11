import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActionSheetIOS, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SwipeableFlatList } from 'react-native-swipeable-flat-list';
import {
    shareMessage,
    shareLink,
    sharePictures
} from 'react-native-share-local'
import Constants from "./Constants";
import DataCenter from './data';
import { CachedImage } from "react-native-img-cache";

export default class Favourites extends Component {

    constructor(props) {
        super(props)
        this.state = {
            datas: [

            ],
            loading: true,
        }
    }

    static navigationOptions = {
        title: '分享模版',
        headerStyle: {
            backgroundColor: Constants.global.mehoBlue,
        },
        headerTintColor: Constants.global.mehoWhite,
    }

    componentDidMount() {
        this.getFavourites();
    }

    getFavourites = () => {
        this.setState({
            loading: true
        }, () => {
            DataCenter.getFavourites(this._notify);
        });
    }

    _notify = (results) => {
        this.setState({
            loading: false,
            datas: results,
        });
    }

    getImage = (favourite) => {
        if (item.imageBase64) {
            return { uri: item.imageBase64 };
        }
        else {
            return { uri: item.imageString, cache: 'default', };
        }
    }

    _sharing = (item) => {
        var option = {
            title: item['text'],
            imagesUrl: item['images'],
            callback: (error) => {
                if (!error) {
                    alert("这是回调方法")
                }
            }
        }
        sharePictures(option);
    }

    _editOnPress = (item) => {
        ActionSheetIOS.showActionSheetWithOptions({
            options: ['取消', '编辑', '删除'],
            destructiveButtonIndex: 2,
            cancelButtonIndex: 0,
        },
            (buttonIndex) => {
                if (buttonIndex === 1) {
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

                    DataCenter.getTemplateDetail(item['templateID'], (template) => {
                        this.setState({ loading: false });
                        this.props.navigation.navigate(
                            'EditContent',
                            {
                                goodsID: item['goodsID'],
                                title: item['title'],
                                price: item['price'],
                                description: item['text'],
                                datas: images,
                                template: template,
                            }
                        )
                    });
                }
                else if (buttonIndex === 2) {
                    DataCenter.deleteFavourite(item['key'])
                }
            }
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar barStyle='light-content' />
                <ActivityIndicator style={{ position: "absolute", top: 20, left: Constants.screenWidth() / 2 - 20, width: 40, height: 40 }}
                    size="large"
                    color={Constants.global.mehoBlue}
                    hidesWhenStopped={true}
                    animating={this.state.loading}
                />
                <FlatList style={style.flatList}
                    data={this.state.datas}
                    renderItem={this.renderTemplateItem.bind(this)}
                    ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
                    ListFooterComponent={() => <View style={style.footerView} />}
                />
            </View>
        )
    };

    renderTemplateItem = ({ item }) => {
        return (
            <View style={style.container}>
                <FlatList horizontal={true}
                    data={item['images']}
                    renderItem={(imageItem) =>
                        this.renderImage(imageItem.item)
                    }
                    ItemSeparatorComponent={() => <View style={style.imageItemSeparator} />}
                />
                <Text style={style.titleText}>{item['text']}</Text>
                <View style={style.separatorView} />
                <View style={style.buttonContainer}>
                    <TouchableOpacity style={style.editButton} onPress={() => this._editOnPress(item)}>
                        <Text style={style.editButtonText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={style.shareButton} onPress={() => this._sharing(item)}>
                        <Text style={style.shareButtonText}>直接分享</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    renderImage = (item) => {
        if (item.startsWith('data:')) {
            return <Image style={style.itemImage}
                source={{ uri: item }}
                height={(Constants.screenWidth() - 73) / 4}
                width={(Constants.screenWidth() - 73) / 4}
                resizeMode="contain"
            />
        }
        else {
            return <CachedImage style={style.itemImage}
                source={{ uri: item }}
                height={(Constants.screenWidth() - 73) / 4}
                width={(Constants.screenWidth() - 73) / 4}
                resizeMode="contain"
            />
        }
    }
}

const style = StyleSheet.create({
    flatList: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 15,
    },
    container: {
        backgroundColor: Constants.global.mehoWhite,
        borderColor: Constants.global.mehoGrey,
        borderWidth: 1,
        padding: 10
    },
    itemImage: {
        backgroundColor: Constants.global.mehoGrey,
        height: 80,
        width: 80,
    },
    imageItemSeparator: {
        width: 10,
    },
    itemSeparator: {
        height: 10,
    },
    footerView: {
        height: 40,
    },
    separatorView: {
        backgroundColor: Constants.global.mehoGrey,
        marginTop: 20,
        marginBottom: 15,
        height: 1
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    titleText: {
        marginTop: 20,
        fontSize: Constants.global.mehoMainTextFontSize,
        fontWeight: 'bold',
        color: Constants.global.mehoMainTextColor,
    },
    shareButton: {
        height: 30,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginLeft: 10,
        backgroundColor: Constants.global.mehoBlue,
    },
    shareButtonText: {
        fontSize: Constants.global.mehoSecondTextFontSize,
        color: Constants.global.mehoWhite,
    },
    editButton: {
        height: 30,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        borderColor: Constants.global.mehoBlue,
        borderWidth: 1,
    },
    editButtonText: {
        fontSize: Constants.global.mehoSecondTextFontSize,
        color: Constants.global.mehoBlue,
    },
})
