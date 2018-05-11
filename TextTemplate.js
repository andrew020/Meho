import React, { Component } from 'react';
import constants from "./Constants";
import {
    FlatList,
    StyleSheet,
    Image,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import DataCenter from './data'

export default class TextTemplate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datas: [],
            isFetching: false,
        }
        this.pageIndex = 1
        this.pageSize = 30
        this.laodingMore = false
    }

    componentDidMount() {
        this._onRefresh();
    }

    _onRefresh = () => {
        if (this.laodingMore) {
            return;
        }
        this.setState({
            isFetching: true,
        }, () => {
            DataCenter.getTextTemplate(1, this.pageSize, (results, msg) => {
                if (results && results.length) {
                    this.pageIndex = 2;
                    this.setState({
                        isFetching: false,
                        datas: results,
                    });
                }

                if (msg && msg.length) {
                    this.setState({
                        isFetching: false,
                    }, () => {
                        Alert.alert(
                            "文字模版",
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
        DataCenter.getTextTemplate(this.pageIndex, this.pageSize, (results, msg) => {
            if (results && results.length) {
                this.pageIndex += 1;
                this.setState(
                    {
                        datas: this.state.datas.concat(results),
                    },
                    () => {
                        this.laodingMore = true;
                    }
                );
            }

            if (msg && msg.length) {
                Alert(
                    "文字模版",
                    msg,
                );
            }
        });
    }

    _onPressItem = (index, item) => {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.select(item);
    }

    render() {
        return (
            <View flex={1}>
                <StatusBar barStyle='light-content' />
                <FlatList style={styles.flatList}
                    data={this.state.datas}
                    renderItem={({ index, item }) =>
                        <TouchableOpacity onPress={() => this._onPressItem(index, item)}>
                            <View style={styles.item}>
                                <Text style={styles.text}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    refreshing={this.state.isFetching}
                    onRefresh={this._onRefresh}
                    onEndReached={() => {
                        this._OnLoadMore();
                    }}
                    onEndReachedThreshold={0.05}
                    keyExtractor={(item, index) => item}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    flatList: {
        backgroundColor: constants.global.mehoWhite,
        flex: 1,
    },
    item: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: constants.global.mehoGrey,
    },
    text: {
        fontSize: constants.global.mehoSecondTextFontSize,
        color: constants.global.mehoMainTextColor,
    }
})