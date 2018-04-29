import React, { Component } from 'react';
import {
    mehoMainTextFontSize,
    mehoMainTextFontColor,
    mehoWhite,
    mehoGrey,
    mehoGreen
} from "./Constants";
import {
    FlatList,
    StyleSheet,
    Image,
    Text,
    View,
    StatusBar,
    Dimensions,
    Button
} from 'react-native';
import {
    shareMessage,
    shareLink,
    sharePictures
} from 'react-native-share-local'

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
                <Button
                    onPress={params.share}
                    title="发表"
                    color={mehoGreen}
                />
            ),
        };
    };

    componentWillMount() {
        this.props.navigation.setParams({ share: this.share });
    }

    share = () => {
        var option = {
            title: this.state.text,
            imagesUrl: this.state.images,
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
                        <Image style={styles.image}
                            source={{ uri: item.item, cache: 'force-cache' }}
                        />
                    }
                />
            </View>
        );
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
        backgroundColor: mehoGrey,
    }
})