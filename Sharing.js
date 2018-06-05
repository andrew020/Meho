import React, { Component } from 'react';
import {
    mehoMainTextFontSize,
    mehoMainTextFontColor,
    mehoWhite,
    mehoGrey,
    mehoGreen,
    convertImagesURLWithMedial,
} from "./Constants";
import Constants from "./Constants";
import {
    FlatList,
    StyleSheet,
    Image,
    Text,
    View,
    StatusBar,
    Dimensions,
    Button,
    TouchableOpacity
} from 'react-native';
import {
    shareMessage,
    shareLink,
    sharePictures
} from 'react-native-share-local'
import { CachedImage } from "react-native-img-cache";

export default class Sharing extends Component {

    constructor(props) {
        super(props)
        this.state = {
            text: "",
            images: [],
        }
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerRight: (
                <TouchableOpacity onPress={params.share}>
                    <Text style={{ fontSize: 17, color: Constants.global.mehoGreen, paddingLeft: 15, paddingRight: 15 }} >发表</Text>
                </TouchableOpacity>
            ),
        };
    };

    componentWillMount() {
        this.props.navigation.setParams({ share: this.share });
    }

    share = () => {
        var images = [];
        var option = {
            text: this.state.text,
            imagesUrl: convertImagesURLWithMedial(this.state.images),
            callback: (error) => {
                if (!error) {
                    alert("这是回调方法")
                }
            }
        }
        sharePictures(option);
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        if (!params) {
            return;
        }
        this.setState({
            images: params.images,
            text: params.text,
        });
    }

    render() {
        return (
            <View style={styles.rootView}>
                <StatusBar barStyle='default' />
                <Text style={styles.text}>
                    {this.state.text}
                </Text>
                <FlatList style={styles.flatList}
                    scrollEnabled={false}
                    numColumns={4}
                    data={this.state.images}
                    renderItem={(item) =>
                        this.renderImage(item.item)
                    }
                />
            </View>
        );
    }

    renderImage = (item) => {
        if (item.startsWith('data:')) {
            return <Image style={styles.image}
                source={{ uri: item }}
            />
        }
        else {
            return <CachedImage style={styles.image}
                source={{ uri: item }}
            />
        }
    }
}

const styles = StyleSheet.create({
    rootView: {
        flex: 0,
    },
    text: {
        padding: 15,
        fontSize: mehoMainTextFontSize,
        color: mehoMainTextFontColor,
        backgroundColor: mehoWhite,
    },
    flatList: {
        width: Dimensions.get('window').width,
        padding: 10,
        backgroundColor: mehoWhite,
    },
    image: {
        margin: 5,
        width: (Dimensions.get('window').width - 60) / 4,
        height: (Dimensions.get('window').width - 60) / 4,
        resizeMode: "contain"
    }
})