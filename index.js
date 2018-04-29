import React, { Component } from 'react';
import {
    AppRegistry,
    View,
    Image,
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
} from 'react-navigation';
import LoginPage from './LoginPage';
import GoodsList from './GoodsList';
import EditContent from './EditContent';
import Favourite from './Favourite';
import ImageTemplate from './ImageTemplate';
import TextTemplate from './TextTemplate';
import Sharing from './Sharing';

import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
console.disableYellowBox = true;

import Constants from "./Constants";

const Goods = StackNavigator(
    {
        GoodsList: {
            screen: GoodsList,
        },
        EditContent: {
            screen: EditContent,
            navigationOptions: {
                tabBarVisible: false,
            }
        },
        ImageTemplate: {
            screen: ImageTemplate,
            navigationOptions: {
                tabBarVisible: false,
                title: '图片模版',
                headerStyle: {
                    backgroundColor: Constants.global.mehoBlue,
                },
                headerTintColor: Constants.global.mehoWhite,
            }
        },
        TextTemplate: {
            screen: TextTemplate,
            navigationOptions: {
                tabBarVisible: false,
                title: '文案模版',
                headerStyle: {
                    backgroundColor: Constants.global.mehoBlue,
                },
                headerTintColor: Constants.global.mehoWhite,
            }
        },
        Sharing: {
            screen: Sharing,
            navigationOptions: {
                tabBarVisible: false,
                title: '分享到朋友圈',
                headerStyle: {
                    backgroundColor: Constants.global.mehoWhite,
                },
                headerTintColor: Constants.global.mehoMainTextColor,
            }
        },
    },
    {
        initialRouteName: 'GoodsList',
    }
);

const Favourites = StackNavigator(
    {
        Favourite: {
            screen: Favourite,
        },

    },
    {
        initialRouteName: 'Favourite',
    }
);

const Home = TabNavigator(
    {
        Goods: { screen: Goods },
        Favourites: { screen: Favourites },
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName;
                if (routeName === 'Goods') {
                    iconName = focused ? require('./img/首页_选中.png') : require('./img/首页.png');
                } else if (routeName === 'Favourites') {
                    //iconName = `./img/模板${focused ? '_选中' : ''}.png`;
                    iconName = focused ? require('./img/模板_选中.png') : require('./img/模板.png');
                }

                return <Image source={iconName} style={{height: 25, width: 25}} />
            },
        }),

        tabBarOptions: {
            activeTintColor: Constants.global.mehoBlue,
            inactiveTintColor: 'gray',
        },
        initialRouteName: 'Goods',
    }
);

const Register = StackNavigator(
    {
        LoginPage: {
            screen: LoginPage,
        },
        Home: {
            screen: Home,
        },
    },
    {
        initialRouteName: 'Home',
        mode: 'modal',
        headerMode: 'none',
    }
)

AppRegistry.registerComponent('Meho', () => Register);
