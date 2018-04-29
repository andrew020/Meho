'use strict';

import Realm from 'realm';


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
let favouriteRealm = null;
let favouriteNotify = null;

function openRealm(callback) {
    if (null === staticRealm) {
    Realm.open({ schema: [User.schema] })
        .then(realm => {
            staticRealm = realm;
            callback(realm);
            realm.close();
            staticRealm = null;
        })
        .catch(error => {
            callback(null);
        });
    }
    else {
        callback(staticRealm);
    }
}

function openRealmWith(dustRealm, schema, callback) {
    if (null === dustRealm) {
        Realm.open({ schema: schema })
            .then(realm => {
                dustRealm = realm;
                callback(realm);
            })
            .catch(error => {
                callback(null);
            });
    }
    else {
        callback(dustRealm);
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function addFavourite(images, title, text, goodsID, templateID, callback) {
    openRealmWith(favouriteRealm, [Favourite.schema], realm => {

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
                    goodsID: goodsID,
                    templateID: templateID,
                    createTimeStamp: timestamp,
                },
                true
            );
        });

        callback(true, null);
    });

    // Realm.open({ schema: [Favourite.schema] })
    //     .then(realm => {

    //         var id = uuidv4();
    //         var timestamp = Math.floor(Date.now() / 1000);

    //         realm.write(() => {
    //             realm.create(
    //                 'Favourite',
    //                 {
    //                     id: id,
    //                     images: images,
    //                     text: text,
    //                     goodsID: goodsID,
    //                     templateID: templateID,
    //                     createTimeStamp: timestamp,
    //                 },
    //                 true
    //             );
    //         });

    //         realm.close();

    //         callback(true, null);
    //     })
    //     .catch(error => {
    //         callback(false, error);
    //     });
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
        // goodsID: 'string',
        // templateID: 'string',
        // createTimeStamp: 'float',
        var item = arrayResults[index];
        var data = {};
        data['key'] = item.id;
        var images = Array.from(item.images)
        data['images'] = images;
        data['text'] = item.text;
        data['goodsID'] = item.goodsID;
        data['templateID'] = item.templateID;
        results.push(data);
    }
    favouriteNotify(results);
}

function deleteFavourite(id) {
    openRealmWith(favouriteRealm, [Favourite.schema], realm => {
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
    openRealmWith(favouriteRealm, [Favourite.schema], realm => {
        favouriteNotify = callback;
        if (realm) {
            var objects = realm.objects('Favourite');
            sendNewFavourites(objects);
            objects.addListener((pupies, changes) => {
                sendNewFavourites(pupies);
            });
        }
        else {
            callback([]);
        }
    });

    // Realm.open({ schema: [Favourite.schema] })
    //     .then(realm => {
    //         var objects = realm.objects('Favourite');
    //         //const arrayResults = _.values(objects)
    //         var arrayResults = Array.from(objects)
    //         var results = [];
    //         for (var index = 0; index < arrayResults.length; index++) {
    //             // id: 'string',
    //             // images: 'string[]',
    //             // text: 'string',
    //             // goodsID: 'string',
    //             // templateID: 'string',
    //             // createTimeStamp: 'float',
    //             var item = arrayResults[index];
    //             var data = {};
    //             data['key'] = item.id;
    //             var images = Array.from(item.images)
    //             data['images'] = images;
    //             data['text'] = item.text;
    //             data['goodsID'] = item.goodsID;
    //             data['templateID'] = item.templateID;
    //             results.push(data);
    //         }
    //         realm.close();
    //         callback(results);

    //     })
    //     .catch(error => {
    //         callback([]);
    //     });
}

function checkUser(callback) {
    openRealm(realm => {
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
    openRealm(realm => {
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
                        item['images'] = goodsInfo['goods_images'];
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

export default {
    checkUser: checkUser.bind(),
    setUser: setUser.bind(),
    getTemplateList: getTemplateList.bind(),
    addFavourite: addFavourite.bind(),
    getFavourites: getFavourites.bind(),
    getGoodsList: getGoodsList.bind(),
    deleteFavourite: deleteFavourite.bind(),
    getTemplateDetail: getTemplateDetail.bind(),
};
