import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, NativeModules, Alert, ScrollView, StatusBar, Platform } from 'react-native';
import Constants from "./Constants";
import DataCenter from './data';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    shareMessage,
    shareLink,
    sharePictures
} from 'react-native-share-local'
import { CachedImage, ImageCache } from "react-native-img-cache";
import LoadingView from 'rn-loading-view';

export default class EditContent extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            goodsID: "",
            title: "",
            price: "",
            description: "",
            imageTemplate: null,
            datas: [],
            // {
            //     key: "1",
            //     imageString: 'https://wx.qlogo.cn/mmopen/vi_32/X7ynBZUxuKr02zR2KOP8Ct1HCiagXka3FQdko7YJFKouuNZGvRLznYoe8LmzUvaVr0u4qiaicXIfc2sQh6dWRmUTQ/0',
            //     imageBase64: null,
            //     selected: true,
            // },
            // {
            //     key: "2",
            //     imageString: 'https://wx.qlogo.cn/mmopen/vi_32/X7ynBZUxuKr02zR2KOP8Ct1HCiagXka3FQdko7YJFKouuNZGvRLznYoe8LmzUvaVr0u4qiaicXIfc2sQh6dWRmUTQ/0',
            //     imageBase64: null,
            //     selected: true,
            // },
        }
        this.goodsCodeUrl = null
    }

    static navigationOptions = {
        title: '分享图文',
        headerStyle: {
            backgroundColor: Constants.global.mehoBlue,
        },
        headerTintColor: Constants.global.mehoWhite,
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        if (!params) {
            return;
        }
        var datasString = JSON.stringify(params.datas);
        var newDatas = JSON.parse(datasString);
        this.setState({
            goodsID: params.goodsID,
            title: params.title,
            price: params.price,
            description: params.description,
            imageTemplate: params.template,
            datas: newDatas,
        });
    }

    onSelectTextTemplate = data => {
        this.setState({
            description: data
        });
    }

    onSelectImageTemplate = data => {

        this.setState(
            {
                loading: true
            },
            () => {
                var imageTemplate = data.data;
                var newDatas = [];
                var indexs = [];
                for (var index = 0; index < this.state.datas.length; index++) {
                    var item = Object.assign({}, this.state.datas[index]);
                    if (item.selected === true) {
                        item.imageString = Constants.getMedialImageURL(item.imageString);
                        newDatas.push(item);
                        indexs.push(index);
                    }
                }


                var callback = (error, newGoodsInfo) => {
                    var copyDatas = this.state.datas;
                    for (var index = 0; index < newGoodsInfo.length; index++) {
                        var item = newGoodsInfo[index];
                        item.imageString = Constants.getSmallImageURL(item.imageString);
                        var originalIndex = indexs[index];
                        copyDatas[originalIndex] = item;
                    }

                    this.setState({
                        loading: false,
                        datas: copyDatas,
                        imageTemplate: imageTemplate,
                    });
                }

                if (!this.goodsCodeUrl) {
                    DataCenter.createGoodsCode(this.state.goodsID, (data, error) => {
                        if (!data) {
                            Alert.alert("编辑", "未能获取商品二维码");
                        }
                        else {
                            this.goodsCodeUrl = data;
                        }

                        DataCenter.checkUser((id, name, label, avatar, memberid) => {
                            NativeModules.ImageDrawer.drawGoods(newDatas, this.state.title, this.state.price, imageTemplate, this.goodsCodeUrl, avatar, callback);
                        });
                    });
                }
                else {
                    DataCenter.checkUser((id, name, label, avatar, memberid) => {
                        NativeModules.ImageDrawer.drawGoods(newDatas, this.state.title, this.state.price, imageTemplate, this.goodsCodeUrl, avatar, callback);
                    });
                }
            }
        );
    };

    getImageData = (item, index) => {
        if (item.imageBase64) {
            return { uri: item.imageBase64 };
        }
        else {
            return { uri: item.imageString };
        }
    }

    selectItem = (item, index) => {
        var newDatas = this.state.datas;
        var excited = this.state.datas[index];
        if (item['key'] === excited['key']) {
            item['selected'] = !excited['selected']
            newDatas[index] = item;
            this.setState({
                datas: newDatas,
            });
        }
    }

    addFavourite = () => {
        var images = [];
        var datas = this.state.datas;
        for (var index = 0; index < datas.length; index++) {
            var item = datas[index];
            var imageString = item['imageString'] + ' , ' + (item['imageBase64'] ? item['imageBase64'] : "");
            images.push(imageString);
        }

        DataCenter.addFavourite(
            images,
            this.state.title,
            this.state.description ? this.state.description : '',
            this.state.price,
            this.state.goodsID,
            this.state.imageTemplate ? this.state.imageTemplate['id'] : '',
            (result, error) => {
                var text = result ? "保存成功" : error;
                Alert.alert(
                    "编辑",
                    text
                );
            }
        );
    }

    _goToSharing = () => {
        var images = [];
        for (var index = 0; index < this.state.datas.length; index++) {
            var imageInfo = this.state.datas[index];
            var image = ''
            if (imageInfo.imageBase64) {
                image = imageInfo.imageBase64;
            }
            else {
                image = imageInfo.imageString;
            }
            images.push(image);
        }
        this.props.navigation.navigate(
            'Sharing',
            {
                text: "#" + this.state.title + "#" + this.state.description,
                images: images,
            }
        )
    }

    _goToFriends = () => {
        var images = [];
        for (var index = 0; index < this.state.datas.length; index++) {
            var imageInfo = this.state.datas[index];
            var image = ''
            if (imageInfo.imageBase64) {
                image = imageInfo.imageBase64;
            }
            else {
                image = imageInfo.imageString;
            }
            images.push(image);
        }
        var newDescription = "#" + this.state.title + "#" + this.state.description;
        var option = {
            text: newDescription,
            imagesUrl: Constants.convertImagesURLWithMedial(images),
            callback: (error) => {
                if (!error) {
                    alert("这是回调方法")
                }
            }
        }
        sharePictures(option);
    }

    _goToImageTemplate = () => {
        const result = this.state.datas.filter((item) => item.selected === true);
        if (result.length === 0) {
            Alert.alert(
                "编辑",
                "未选择图片",
            );
        }
        else {
            this.props.navigation.navigate('ImageTemplate',
                {
                    select: this.onSelectImageTemplate,
                    text: this.state.description,
                    price: this.state.price,
                }
            )
        }
    }

    _goToTextTemplate = () => {
        this.props.navigation.navigate('TextTemplate',
            {
                select: this.onSelectTextTemplate,
            }
        )
    }

    _ItemImage = (item) => {
        if (item.item.imageBase64) {
            return <Image style={style.itemImage}
                source={this.getImageData(item.item, item.index)}
                resizeMode='contain'
            />
        }
        else {
            return <CachedImage style={style.itemImage}
                source={this.getImageData(item.item, item.index)}
                resizeMode='contain'
            />
        }
    }

    _keyboardDismissMode = () => {
        if (Platform.OS === 'android') {
            return "interactive";
        }
        else {
            return "on-drag";
        }
    }

    render() {
        return (
            <View style={style.rootView}>
                <StatusBar barStyle='light-content' />
                <KeyboardAwareScrollView flex={1} keyboardDismissMode={this._keyboardDismissMode()}>
                    <View style={style.container}>
                        <View style={style.titleView}>
                            <Text style={style.titleText}>图片选择</Text>
                            <TouchableOpacity
                                onPress={this._goToImageTemplate}>
                                <Text style={style.templateText}>图片模版</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList style={style.flatList}
                            horizontal={true}
                            data={this.state.datas}
                            renderItem={(item) =>
                                <View height={(Constants.screenWidth() - 40) / 3.0}
                                    width={(Constants.screenWidth() - 40) / 3.0}
                                >
                                    {this._ItemImage(item)}
                                    <TouchableOpacity style={style.checkButton}
                                        onPress={() => {
                                            this.selectItem(item.item, item.index);
                                        }}>
                                        <Image style={style.checkImage}
                                            source={item.item['selected'] ? require('./img/选址框_选中.png') : require('./img/选址框.png')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            }
                            keyExtractor={(item, index) => (item.imageBase64 ? item.imageBase64 : item.imageString)}
                            ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
                        />
                        <View style={style.titleView}>
                            <Text style={style.titleText}>分享文案</Text>
                            <TouchableOpacity
                                onPress={this._goToTextTemplate}>
                                <Text style={style.templateText}>文案模版</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput ref="text"
                            style={style.textInput}
                            multiline={true}
                            numberOfLines={999}
                            value={this.state.description}
                            onChangeText={(text) => this.setState({ description: text })} />
                    </View>
                </KeyboardAwareScrollView>
                <View style={style.bottomContainer}>
                    <Text style={style.shareTitleText}>分享到</Text>
                    <View style={style.buttonBar}>
                        <TouchableOpacity style={style.addTemplateButton} onPress={() => { this.addFavourite() }}>
                            <View style={style.buttonContainer}>
                                <Image source={require('./img/存为模板.png')} style={style.buttonImage} />
                                <Text style={style.buttonText}>添加模版</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this._goToSharing()}>
                            <View style={style.buttonContainer}>
                                <Image source={require('./img/分享朋友圈.png')} style={style.buttonImageWithPadding} />
                                <Text style={style.buttonText}>朋友圈</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this._goToFriends()}>
                            <View style={style.buttonContainer}>
                                <Image source={require('./img/发给朋友.png')} style={style.buttonImage} />
                                <Text style={style.buttonText}>微信好友</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.renderLoading()}
            </View>
        )
    };

    renderLoading() {
        const spinnerProps = { size: 'large', color: 'rgba(1,1,1,1)' }

        if (this.state.loading) {
            return <View style={style.loadingView}>
                <LoadingView
                    text={'处理中...'}
                    textProps={{ style: style.loadingText }}
                    renderButton={false}
                    spinnerProps={spinnerProps}
                />
            </View>
        }
        else {
            return null;
        }
    }
}

const style = StyleSheet.create({
    rootView: {
        flex: 1,
        backgroundColor: Constants.global.mehoWhite,
    },
    container: {
        backgroundColor: Constants.global.mehoWhite,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'flex-start'
    },
    titleView: {
        flexDirection: 'row',
        justifyContent: "space-between",
        paddingTop: 18,
        paddingBottom: 16,
        alignItems: 'center',
    },
    titleText: {
        color: Constants.global.mehoMainTextColor,
        fontSize: Constants.global.mehoMainTextFontSize,
        fontWeight: 'bold',
    },
    templateText: {
        color: Constants.global.mehoBlue,
        fontSize: Constants.global.mehoSecondTextFontSize,
    },
    itemImage: {
        flex: 1,
        backgroundColor: Constants.global.mehoGrey,
    },
    checkButton: {
        top: 0,
        right: 0,
        height: 25,
        width: 25,
        position: 'absolute',
    },
    checkImage: {
        top: 0,
        right: 0,
        height: 15,
        width: 15,
        position: 'absolute',
    },
    itemSeparator: {
        width: 10,
    },
    textInput: {
        alignSelf: 'stretch',
        borderColor: Constants.global.mehoGrey,
        borderWidth: 1,
        fontSize: Constants.global.mehoSecondTextFontSize,
        color: Constants.global.mehoSecondTextColor,
        height: 150,
        padding: 5,
        textAlignVertical: "top",
        flex: 0,
    },
    bottomContainer: {
        alignSelf: 'stretch',
        alignItems: 'stretch',
        borderTopWidth: 1,
        borderColor: Constants.global.mehoGrey,
        backgroundColor: Constants.global.mehoWhite,
        height: 100,
        justifyContent: 'space-evenly',
    },
    shareTitleText: {
        alignSelf: 'center',
    },
    buttonBar: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonContainer: {
        width: 60,
        alignItems: 'center',
    },
    buttonImage: {
        height: 30,
        width: 30,
    },
    buttonImageWithPadding: {
        height: 24,
        width: 24,
        margin: 3,
    },
    buttonText: {
        fontSize: Constants.global.mehoSecondTextFontSize,
        color: Constants.global.mehoSecondTextColor
    },
    addTemplateButton: {
        position: 'absolute',
        left: 10
    },
    loadingText: {
        fontSize: Constants.global.mehoMainTextFontSize,
        color: Constants.global.mehoMainTextColor
    },
    loadingView: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#00000030',
    },
})
