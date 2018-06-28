/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    Button,
    TouchableHighlight,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    Keyboard,
    StatusBar
} from 'react-native';
import Constants from './Constants';
import DataCenter from './data';
import * as wechat from 'react-native-wechat'

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
        'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

function scale() {
    return Constants.screenHeight() / 667.0
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 125 * scale() - 25
    },
    appNameFont: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    normalFont: {
        fontSize: 17,
        textAlign: 'center',
    },
    wechatButton: {
        backgroundColor: Constants.global.mehoBlue,
        borderRadius: 22,
        height: 44,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 72 * scale() - 22,
        alignSelf: 'stretch',
    },
    wechatButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
    },
    phoneNumberButton: {
        borderColor: Constants.global.mehoBlue,
        borderWidth: 1,
        borderRadius: 22,
        height: 44,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 72 * scale() - 22,
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: "center",
    },
    phoneNumberButtonText: {
        fontSize: 16,
        color: Constants.global.mehoBlue,
    },
    tipFont: {
        fontSize: 12,
        textAlign: 'center',
        color: 'gray'
    },
    smallFont: {
        fontSize: 10,
        textAlign: 'center',
        color: 'gray'
    },
    wechatButtonImage: {
        width: 40,
        height: 40,
    },
    wechatButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});

const popViewStyles = StyleSheet.create({
    mask: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#00000050',
    },
    container: {
        justifyContent: 'space-around',
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    titleContainer: {
        margin: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 17,
        color: 'black',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    closeImage: {
        width: 10,
        height: 10,
    },
    inputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        borderColor: 'lightgrey',
        borderWidth: 0.5,
        marginTop: 8,
        marginLeft: 8,
        marginRight: 8,
        height: 50,
    },
    inputTitle: {
        borderColor: 'black',
        marginTop: 10,
        marginLeft: 15,
        //marginRight: 20,
        marginBottom: 10,
        fontSize: 15,
        width: 70,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    otpButtonText: {
        fontSize: 13,
        color: 'grey',
        marginRight: 15,
    },
    loginButton: {
        backgroundColor: Constants.global.mehoBlue,
        borderRadius: 22,
        height: 44,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 30,
        marginBottom: 30,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: "center",
    },
});

export default class LoginPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowPhoneNumberLogin: false,
            codeComing: -1,
        };
        var codeTimer = null;
        this.keyboardHeight = new Animated.Value(0);
    }

    componentWillMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: event.endCoordinates.height,
            })
        ]).start();
    };

    keyboardWillHide = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: 0,
            })
        ]).start();
    };

    isValiedNumber = (text) => {
        var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        var phoneFlag = text == null ? false : reg.test(text);
        return phoneFlag
    }

    startOTPTimer = () => {
        this.codeTimer = setInterval(() => {
            if (this.state.codeComing <= 0) {
                this.stopOTPTimer();
            }
            else {
                this.setState({
                    codeComing: this.state.codeComing - 1,
                });
            }
        }, 1000);
    }

    stopOTPTimer = () => {
        this.codeTimer && clearInterval(this.codeTimer);
        this.codeTimer = null
        this.setState({
            codeComing: -1,
        });
    }

    checkPhoneNumber = (text) => {
        var shouldContinue = false;
        var msg = '';
        if (!text || !this.isValiedNumber(text)) {
            Alert.alert(
                "登录",
                "无效的手机号"
            );
            return;
        }

        if (this.codeTimer == null) {
            this.setState({
                codeComing: 59,
            }, () => {
                this.startOTPTimer();

                let formData = new FormData();
                formData.append('phone', text);
                formData.append('port', 8081);
                fetch(Constants.formatRequestURL(Constants.global.domain, Constants.global.apiCategoryMobile, "check_phone"), {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        if (data['code'] !== 1) {
                            Alert.alert(
                                "登录",
                                data['msg']
                            );
                            this.stopOTPTimer();
                        }
                        else {
                            this.getOTPCode(text);
                        }
                    }).catch((error) => {
                        this.stopOTPTimer();
                        console.warn(error);
                    });
            });
        }
    }

    getOTPCode = (text) => {
        if (!text || !this.isValiedNumber(text)) {
            Alert.alert(
                "登录",
                "无效的手机号"
            );
            return;
        }


        let formData = new FormData();
        formData = new FormData();
        formData.append('phone', text);
        formData.append('port', 8081);
        fetch(Constants.formatRequestURL(Constants.global.domain, Constants.global.apiCategoryMobile, "send_code"), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                console.log(result);
                if (result['code'] !== 1) {
                    this.stopOTPTimer();
                    Alert.alert(
                        "登录",
                        result['msg']
                    );
                    return;
                }
            })
            .catch((error) => {
                this.stopOTPTimer();
                console.warn(error);
            });
    }

    login = (phone, OTP) => {
        if (!phone || !this.isValiedNumber(phone)) {
            Alert.alert(
                "登录",
                "无效的手机号"
            );
            return;
        }

        if (!OTP || OTP.length != 6) {
            Alert.alert(
                "登录",
                "无效的验证码"
            );
            return;
        }
        let formData = new FormData();
        formData.append('phone', phone);
        formData.append('port', 8081);
        formData.append('code', OTP);
        fetch(Constants.formatRequestURL(Constants.global.domain, Constants.global.apiCategoryMobile, "phone_login"), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                console.log(result);
                if (result['code'] === 1) {
                    DataCenter.setUser(
                        result['data']['id'],
                        result['data']['store_image'],
                        result['data']['store_name'],
                        result['data']['store_title'],
                        result['data']['phone'],
                        '',
                        result['data']['member_id'],
                        (succes, msg) => {
                            if (succes) {
                                const { navigation } = this.props;
                                navigation.goBack();
                                navigation.state.params.doLogin();
                            }
                            else {
                                Alert.alert(
                                    "登录",
                                    msg
                                );
                            }
                        }
                    );
                }
                else {
                    Alert.alert(
                        "登录",
                        result['msg']
                    );
                }
            })
            .catch((error) => {
                console.warn(error);
            });
    }

    showPhoneNumberLogin() {
        if (this.state.isShowPhoneNumberLogin) {
            return (<Animated.View style={popViewStyles.mask} bottom={this.keyboardHeight}>
                <View style={popViewStyles.container}>
                    <View style={popViewStyles.titleContainer}>
                        <Text style={popViewStyles.title}>手机号登录</Text>
                        <TouchableOpacity style={popViewStyles.closeButton} onPress={() => {
                            this.stopOTPTimer();
                            this.setState({ isShowPhoneNumberLogin: false })
                        }}>
                            <Image style={popViewStyles.closeImage} source={require('./img/close.png')} />
                        </TouchableOpacity >
                    </View >
                    <View style={popViewStyles.inputContainer}>
                        <Text style={popViewStyles.inputTitle}>手机号码</Text>
                        <TextInput ref="phoneNumber"
                            placeholder="请输入手机号"
                            style={popViewStyles.input}
                            keyboardType='phone-pad'
                        />
                        <TouchableOpacity disabled={this.state.codeComing >= 0}
                            onPress={() => {
                                this.checkPhoneNumber(this.refs.phoneNumber._lastNativeText);
                            }}>
                            <Text style={popViewStyles.otpButtonText}>
                                {this.state.codeComing < 0 ? "获取验证码" : this.state.codeComing}
                            </Text>
                        </TouchableOpacity >
                    </View >
                    <View style={popViewStyles.inputContainer}>
                        <Text style={popViewStyles.inputTitle}>验证码</Text>
                        <TextInput ref="OTPCode"
                            placeholder="请输入验证码"
                            style={popViewStyles.input}
                            keyboardType='phone-pad'
                        />
                    </View >
                    <TouchableOpacity style={popViewStyles.loginButton} onPress={() => {
                        this.login(this.refs.phoneNumber._lastNativeText, this.refs.OTPCode._lastNativeText);
                    }}>
                        <Text style={styles.wechatButtonText}>登录</Text>
                    </TouchableOpacity >
                </View >
            </Animated.View >)
        }
    }

    _wechatLoginHandler = (responseCode) => {
        console.log(responseCode.code);
        DataCenter.wechatLogin(
            responseCode.code,
            (succes, msg) => {
                if (succes) {
                    const { navigation } = this.props;
                    navigation.goBack();
                    navigation.state.params.doLogin();
                }
                else {
                    Alert.alert(
                        "登录",
                        msg
                    );
                }
            }
        );
    }

    _wechatLoginErrorHandler = (err) => {
        Alert.alert('登录授权发生错误：', err.message, [
            { text: '确定' }
        ]);
    }

    _wechatLogin = () => {
        let scope = 'snsapi_userinfo';
        let state = 'wechat_sdk_demo';

        wechat.isWXAppInstalled()
            .then((isInstalled) => {
                isInstalled = false;
                if (isInstalled) {
                    wechat.sendAuthRequest(scope, state)
                        .then(this._wechatLoginHandler)
                        .catch(this._wechatLoginErrorHandler);
                }
                else {
                    Platform.OS == 'ios' ?
                        wechat.sendAuthRequestWithoutApp(scope, state)
                            .then(this._wechatLoginHandler)
                            .catch(this._wechatLoginErrorHandler) :
                        Alert.alert('没有安装微信', '请先安装微信客户端在进行登录', [
                            { text: '确定' }
                        ]);
                }
            })
    }

    render() {
        return (
            <View flex={1}>
                <StatusBar barStyle='default' />
                <View style={styles.container}>
                    <Image source={require('./img/LOGO.png')}
                        style={styles.avatar}
                    />
                    <View flex={0} marginTop={35 * scale() - 15}>
                        <Text style={styles.normalFont}>
                            <Text style={styles.appNameFont}>密货 </Text>
                            - 一键分享
                        </Text>
                    </View>
                    <Text style={styles.smallFont}>one key sharing</Text>
                    <TouchableOpacity style={styles.wechatButton}
                        onPress={this._wechatLogin}>
                        <View style={styles.wechatButtonContainer}>
                            <Image source={require('./img/wechat.png')}
                                style={styles.wechatButtonImage}
                            />
                            <Text style={styles.wechatButtonText}>微信登录</Text>
                        </View>
                    </TouchableOpacity>
                    <View flex={0} marginTop={50 * scale() - 10}>
                        <Text style={styles.normalFont}>或</Text>
                    </View>
                    <TouchableOpacity style={styles.phoneNumberButton}
                        onPress={() => {
                            this.setState({ isShowPhoneNumberLogin: true })
                        }
                        }>
                        <Text style={styles.phoneNumberButtonText}>使用手机号登录</Text>
                    </TouchableOpacity>
                    <View flex={0} position='absolute' top={Constants.screenHeight() - 60}>
                        <Text style={styles.tipFont}>美货科技提供技术支持</Text>
                        <Text style={styles.tipFont}>www.mehoin.com</Text>
                    </View>
                </View>
                {this.showPhoneNumberLogin()}
            </View>
        );
    }
}
