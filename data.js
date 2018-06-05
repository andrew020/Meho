'use strict';

import Realm from 'realm';
import Constants from './Constants'

class User {

}
User.schema = {
    name: 'User',
    primaryKey: 'userID',
    properties: {
        userID: 'string',
        avatar: 'string',
        name: 'string',
        sign: 'string',
        phoneNumber: 'string',
        wxOpenID: 'string'
    }
};

class Favourite {

}
Favourite.schema = {
    name: 'Favourite',
    primaryKey: 'id',
    properties: {
        id: 'string',
        images: 'string[]',
        title: 'string',
        text: 'string',
        price: 'string',
        goodsID: 'string',
        templateID: 'string',
        createTimeStamp: 'float',
    }
};

class Template {

}
Template.schema = {
    name: 'Template',
    primaryKey: 'userID',
    properties: {
        id: 'string',
        background_image: 'string',
        background_image_xy: 'string',
        goods_image_xy: 'string',
        goods_image_title_xy: 'string',
        goods_price_xy: 'string',
        code_xy: 'string',
        create_time: 'string',
        template_name: 'string',
    }
};

let staticRealm = null;
let favouriteNotify = null;
let favourites = null;

function openRealm(keepRealm, callback) {
    if (keepRealm || null === staticRealm) {
        Realm.open({ schema: [User.schema, Favourite.schema] })
            .then(realm => {
                staticRealm = realm;
                callback(realm);
            })
            .catch(error => {
                callback(null);
            });
    }
    else {
        callback(staticRealm);
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function addFavourite(images, title, text, price, goodsID, templateID, callback) {
    openRealm(true, realm => {

        if (null === realm) {
            callback(false, error);
            return;
        }
        var id = uuidv4();
        var timestamp = Math.floor(Date.now() / 1000);

        realm.write(() => {
            realm.create(
                'Favourite',
                {
                    id: id,
                    images: images,
                    title: title,
                    text: text,
                    price: price,
                    goodsID: goodsID,
                    templateID: templateID,
                    createTimeStamp: timestamp,
                },
                true
            );
        });

        callback(true, null);
    });
}

function sendNewFavourites(objects) {
    if (!objects) {
        favouriteNotify([]);
        return;
    }

    let sortedObjects = objects.sorted('createTimeStamp');
    var arrayResults = Array.from(sortedObjects)
    var results = [];
    for (var index = 0; index < arrayResults.length; index++) {
        // id: 'string',
        // images: 'string[]',
        // text: 'string',
        // title: 'string',
        // goodsID: 'string',
        // templateID: 'string',
        // createTimeStamp: 'float',
        var item = arrayResults[index];
        var data = {};
        data['key'] = item.id;
        // var images = [];
        // let imageObjects = Array.from(item.images);
        // for (var indexForImage = 0; indexForImage < imageObjects.length; indexForImage++) {
        //     let imageObject = imageObjects[indexForImage];
        //     images.push(imageObject);
        // }
        var imagesString = Array.from(item.images);
        var images = [];
        for (var imageindex = 0; imageindex < imagesString.length; imageindex++) {
            var dic = {};
            var imageString = imagesString[imageindex];
            var array = imageString.split(" , ");
            images.push({
                "imageString": array[0],
                "imageBase64": array[1],
            });
        }
        data['images'] = images;
        data['title'] = item.title;
        data['text'] = item.text;
        data['price'] = item.price;
        data['goodsID'] = item.goodsID;
        data['templateID'] = item.templateID;
        results.push(data);
    }
    favouriteNotify(results);
}

function deleteFavourite(id) {
    openRealm(true, realm => {
        if (!realm) {
            return;
        }

        realm.write(() => {
            var dust = realm.objects('Favourite').filtered('id = $0', id);
            realm.delete(dust);
        });
    });
}

function getFavourites(callback) {
    openRealm(true, realm => {
        favouriteNotify = callback;
        if (realm && !favourites) {
            favourites = realm.objects('Favourite');
            favourites.addListener((pupies, changes) => {
                sendNewFavourites(favourites);
            });
        }
    });
}

function checkUser(callback) {
    openRealm(false, realm => {
        // callback(1, 'test', 'test', 'https://wx.qlogo.cn/mmopen/vi_32/X7ynBZUxuKr02zR2KOP8Ct1HCiagXka3FQdko7YJFKouuNZGvRLznYoe8LmzUvaVr0u4qiaicXIfc2sQh6dWRmUTQ/0');
        // return;
        let users = realm.objects('User');
        if (users && 0 != users.length) {
            let user = users[0]
            callback(user.userID, user.name, user.sign, user.avatar);
        }
        else {
            callback(null, null, null, null);
        }
    });
}

function setUser(userID,
    avatar,
    name,
    sign,
    phoneNumber,
    wxOpenID,
    callback) {
    openRealm(false, realm => {
        try {
            realm.write(() => {
                let allUsers = realm.objects('User');
                realm.delete(allUsers); // Deletes all books

                realm.create(
                    'User',
                    {
                        userID: userID,
                        avatar: avatar,
                        name: name,
                        sign: sign,
                        phoneNumber: phoneNumber,
                        wxOpenID: wxOpenID
                    },
                    true
                );

                callback(true, '');
            });
        } catch (e) {
            callback(false, e);
        }
    });
}

function getTemplateList(callback) {
    let formData = new FormData();
    formData.append('port', 8081);
    fetch('http://demo1.hixiaoqi.cn/InfSetShopApi/template_list', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Host: 'demo1.hixiaoqi.cn'
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (1 === result['code']) {
                callback(true, result['data'])
            }
            else {
                callback(false, result['msg'])
            }
        })
        .catch((error) => {
            console.warn(error);
            callback(false, error)
        });
}

function getTemplateDetail(id, callback) {
    let formData = new FormData();
    formData.append('port', 8081);
    formData.append('id', id);
    fetch('http://demo1.hixiaoqi.cn/InfSetShopApi/template_detail', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Host: 'demo1.hixiaoqi.cn'
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (1 === result['code']) {
                callback(true, result['data'])
            }
            else {
                callback(false, result['msg'])
            }
        })
        .catch((error) => {
            console.warn(error);
            callback(false, error)
        });
}

function getGoodsList(pageIndex, pageSize, callback) {
    checkUser((id, name, label, avatar) => {
        if (!id) {
            callback(null, '没有找到有效的用户信息');
        }
        let formData = new FormData();
        formData.append('user_id', id);
        formData.append('port', 8081);
        formData.append('goods_state', 1);
        formData.append('page', pageIndex);
        formData.append('page_size', pageSize);
        fetch('http://demo1.hixiaoqi.cn/InfPublishApi/get_my_goods', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                Host: 'demo1.hixiaoqi.cn'
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                console.log(result);
                if (1 === result['code']) {
                    var data = result['data']['goods'];
                    var filter = [];
                    for (var index = 0; index < data.length; index++) {
                        var goodsInfo = data[index];

                        var item = {};
                        item['id'] = goodsInfo['id'];
                        item['name'] = goodsInfo['goods_name'];
                        item['description'] = goodsInfo['goods_description'];
                        var images = [];
                        var max = goodsInfo['goods_images'].length;
                        for (var imageIndex = 0; imageIndex < max; imageIndex++) {
                            images.push(Constants.getSmallImageURL(goodsInfo['goods_images'][imageIndex]));
                        }
                        item['images'] = images;
                        item['price'] = goodsInfo['goods_price'];

                        filter.push(item);
                    }

                    callback(filter, null);
                }
                else {
                    callback(null, result['msg'])
                }
            })
            .catch((error) => {
                console.warn(error);
                callback(null, error)
            });
    });
}

function getTextTemplate(pageIndex, pageSize, callback) {
    let formData = new FormData();
    formData.append('port', 8081);
    formData.append('page', pageIndex);
    formData.append('page_size', pageSize);
    fetch('http://demo1.hixiaoqi.cn/InfMobileApi/get_content_list', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Host: 'demo1.hixiaoqi.cn'
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (1 === result['code']) {
                var data = result['data']['content'];
                var filter = [];
                for (var index = 0; index < data.length; index++) {
                    var itemInfo = data[index];
                    var item = itemInfo.content ? itemInfo.content : "";
                    filter.push(item);
                }
                callback(filter, null);
            }
            else {
                callback(null, result['msg'])
            }
        })
        .catch((error) => {
            console.warn(error);
            callback(null, error)
        });
}

function createGoodsCode(goodsID, callback) {
    let formData = new FormData();
    formData.append('port', 8081);
    formData.append('goods_id', goodsID);
    fetch('http://demo1.hixiaoqi.cn/InfSetShopApi/create_goods_code', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Host: 'demo1.hixiaoqi.cn'
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (1 === result['code']) {
                var data = result['data']['url'];
                callback(data, null);
            }
            else {
                callback(null, result['msg'])
            }
        })
        .catch((error) => {
            console.warn(error);
            callback(null, error)
        });
}

function clearData(callback) {
    openRealm(false, (realm) => {
        realm.write(() => {
            let favourites = realm.objects('Favourite');
            realm.delete(favourites);

            let users = realm.objects('User');
            realm.delete(users);
        });

        callback();
    });
}

function wechatLogin(token, callback) {
    let formData = new FormData();
    formData.append('port', 8081);
    formData.append('code', token);
    formData.append('type', 1); // 1 真实登录，2 模拟登录
    fetch('http://demo1.hixiaoqi.cn/InfMobileApi/wx_auth', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Host: 'demo1.hixiaoqi.cn'
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if (1 === result['code']) {
                setUser(
                    result['data']['id'],
                    result['data']['store_image'],
                    result['data']['store_name'],
                    result['data']['store_title'],
                    result['data']['phone'],
                    '',
                    (succes, msg) => {
                        callback(succes, msg)
                    }
                );
            }
            else {
                callback(false, result['msg'])
            }
        })
        .catch((error) => {
            console.warn(error);
            callback(false, error)
        });
}

export default {
    checkUser: checkUser.bind(),
    setUser: setUser.bind(),
    getTemplateList: getTemplateList.bind(),
    addFavourite: addFavourite.bind(),
    getFavourites: getFavourites.bind(),
    getGoodsList: getGoodsList.bind(),
    deleteFavourite: deleteFavourite.bind(),
    getTemplateDetail: getTemplateDetail.bind(),
    getTextTemplate: getTextTemplate.bind(),
    createGoodsCode: createGoodsCode.bind(),
    clearData: clearData.bind(),
    wechatLogin: wechatLogin.bind(),
};
