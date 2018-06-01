package com.meho;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.sql.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import com.meho.imageCache.ImageCache;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class ImageDrawer extends ReactContextBaseJavaModule implements ImageCache.LoadCompletion {
    private String kAvatarImage = "kAvatarImage";
    private String kQRCodeImage = "kQRCodeImage";
    private String kBackgroundImage= "kBackgroundImage";
    private String kTagImage = "kTagImage";

    private LinkedHashMap<String, String> loadingDic;
    private HashMap<String, Integer> goodsLoadingDic;

    private Bitmap avatarImage;
    private Bitmap QRCodeImage;
    private Bitmap backgroundImage;
    private Bitmap tagImage;

    private Object[] imagesURLStringInfo;
    private HashMap<String, Object> templateInfo;
    private String title;
    private String price;
    Callback callback;

    double scale;
    Integer[] backgroundPoints;
    Integer[] goodsPoints;
    Integer[] tagPoints;
    Integer[] codePoints;
    Integer[] avatarPoints;
    Integer[] titlePoints;
    Integer titleAlign;
    double titleFontSize;
    int titleColor;
    Integer[] pricePoints;
    Integer priceAlign;
    double priceFontSize;
    int priceColor;

    private Context appContext;

    public ImageDrawer(ReactApplicationContext reactContext) {
        super(reactContext);
        appContext = MainApplication.getAppContext();
    }

    @Override
    public String getName() {
        return "ImageDrawer";
    }

    private Object[] toArray(ReadableArray readableArray) {
        Object[] array = new Object[readableArray.size()];

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    array[i] = null;
                    break;
                case Boolean:
                    array[i] = readableArray.getBoolean(i);
                    break;
                case Number:
                    array[i] = readableArray.getDouble(i);
                    break;
                case String:
                    array[i] = readableArray.getString(i);
                    break;
                case Map:
                    array[i] = this.toMap(readableArray.getMap(i));
                    break;
                case Array:
                    array[i] = this.toArray(readableArray.getArray(i));
                    break;
            }
        }

        return array;
    }

    private WritableArray toWritableArray(Object[] array) {
        WritableArray writableArray = Arguments.createArray();

        for (int i = 0; i < array.length; i++) {
            Object value = array[i];

            if (value == null) {
                writableArray.pushNull();
            }
            if (value instanceof Boolean) {
                writableArray.pushBoolean((Boolean) value);
            }
            if (value instanceof Double) {
                writableArray.pushDouble((Double) value);
            }
            if (value instanceof Integer) {
                writableArray.pushInt((Integer) value);
            }
            if (value instanceof String) {
                writableArray.pushString((String) value);
            }
            if (value instanceof Map) {
                writableArray.pushMap(this.toWritableMap((Map<String, Object>) value));
            }
            if (value.getClass().isArray()) {
                writableArray.pushArray(this.toWritableArray((Object[]) value));
            }
        }

        return writableArray;
    }

    private Map<String, Object> toMap(ReadableMap readableMap) {
        Map<String, Object> map = new HashMap<>();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = readableMap.getType(key);

            switch (type) {
                case Null:
                    map.put(key, null);
                    break;
                case Boolean:
                    map.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    map.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    map.put(key, readableMap.getString(key));
                    break;
                case Map:
                    map.put(key, this.toMap(readableMap.getMap(key)));
                    break;
                case Array:
                    map.put(key, this.toArray(readableMap.getArray(key)));
                    break;
            }
        }

        return map;
    }

    private WritableMap toWritableMap(Map<String, Object> map) {
        WritableMap writableMap = Arguments.createMap();
        Iterator iterator = map.entrySet().iterator();

        while (iterator.hasNext()) {
            Map.Entry pair = (Map.Entry)iterator.next();
            Object value = pair.getValue();

            if (value == null) {
                writableMap.putNull((String) pair.getKey());
            } else if (value instanceof Boolean) {
                writableMap.putBoolean((String) pair.getKey(), (Boolean) value);
            } else if (value instanceof Double) {
                writableMap.putDouble((String) pair.getKey(), (Double) value);
            } else if (value instanceof Integer) {
                writableMap.putInt((String) pair.getKey(), (Integer) value);
            } else if (value instanceof String) {
                writableMap.putString((String) pair.getKey(), (String) value);
            } else if (value instanceof Map) {
                writableMap.putMap((String) pair.getKey(), this.toWritableMap((Map<String, Object>) value));
            } else if (value.getClass() != null && value.getClass().isArray()) {
                writableMap.putArray((String) pair.getKey(), this.toWritableArray((Object[]) value));
            }

            iterator.remove();
        }

        return writableMap;
    }

    @ReactMethod
    public void drawGoods (
            ReadableArray imagesURLStringInfo,
            String title,
            String price,
            ReadableMap templateInfo,
            String QRCodeURLString,
            String avatarURLString,
            Callback callback
    ) {
        this.imagesURLStringInfo = this.toArray(imagesURLStringInfo);
        this.templateInfo = templateInfo.toHashMap();
        this.title = title;
        this.price = price;
        this.callback = callback;

        loadingDic = new LinkedHashMap<>();

        if (0 < avatarURLString.length()) {
            loadingDic.put(avatarURLString, kAvatarImage);
        }
        if (0 < QRCodeURLString.length()) {
            loadingDic.put(QRCodeURLString, kQRCodeImage);
        }
        String backgroundImageURLString = (String) this.templateInfo.get("background_image");
        if (0 < backgroundImageURLString.length()) {
            loadingDic.put(backgroundImageURLString, kBackgroundImage);
        }
        String tagImageURLString = (String) this.templateInfo.get("tag_image");
        if (0 < tagImageURLString.length()) {
            loadingDic.put(tagImageURLString, kTagImage);
        }

        if (0 < avatarURLString.length()) {
            ImageCache.getInstanse(appContext).loadImages(this, avatarURLString,false);
        }
        if (0 < QRCodeURLString.length()) {
            ImageCache.getInstanse(appContext).loadImages(this, QRCodeURLString,false);
        }
        if (0 < backgroundImageURLString.length()) {
            ImageCache.getInstanse(appContext).loadImages(this, backgroundImageURLString,false);
        }
        if (0 < tagImageURLString.length()) {
            ImageCache.getInstanse(appContext).loadImages(this, tagImageURLString,false);
        }
    }

    private Integer[] scalePoints(String[] src, double scale) {
        ArrayList<Integer> result = new ArrayList();
        for (Integer index = 0; index < src.length && src[index].length() > 0; index++) {
            result.add((int)(Double.parseDouble(src[index]) * scale));
        }
        Integer[] returnValue = new Integer[result.size()];
        result.toArray(returnValue);
        return returnValue;
    }

    private void drawBitmap(Canvas cv, Bitmap bitmap, Integer[] points) {
        if (null != bitmap) {
            Rect rect = new Rect(points[0], points[1], points[0] + points[2], points[1] + points[3]);
            cv.drawBitmap(bitmap, null, rect, null);
        }
    }

    private void drawText(Canvas cv, String text, float fontSize, int color, int textAlign, Integer[] points) {
        Paint mPaint = new Paint();
        mPaint.setTextSize(fontSize);
        mPaint.setColor(color);
        mPaint.setTextAlign(Paint.Align.LEFT);
        Rect bounds = new Rect();
        mPaint.getTextBounds(text, 0, text.length(), bounds);
        float x = points[0];
        if (textAlign == -1) {
            x -= bounds.width();
        }
        else if (textAlign == 0) {
            x -= bounds.width() / 2;
        }
        cv.drawText(text, x, points[1], mPaint);
    }

    private int getTextColor(String key) {
        String goods_title_color = (String)this.templateInfo.get(key);
        if (goods_title_color.length() < 7) {
            int missingLength = 7 - goods_title_color.length();
            String filled = "";
            for (int index = 0; index < missingLength; index++) {
                filled += "0";
            }
            goods_title_color = goods_title_color.substring(0, 1) + filled + goods_title_color.substring(1, goods_title_color.length());
        }
        return Color.parseColor(goods_title_color);
    }

    @Override
    public void onComplete(Bitmap bitmap, String url) {
        if (0 < loadingDic.size()) {
            String key = loadingDic.remove(url);
            if (kAvatarImage == key) {
                avatarImage = bitmap.copy(Bitmap.Config.ARGB_8888, true);
                Bitmap targetBitmap = Bitmap.createBitmap(avatarImage.getWidth(), avatarImage.getHeight(), Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(targetBitmap);

                Paint paint = new Paint();
                paint.setAntiAlias(true);

                // 值越大角度越明显
                float roundPx = avatarImage.getWidth() / 2;
                float roundPy = avatarImage.getHeight() / 2;

                Rect rect = new Rect(0, 0, avatarImage.getWidth(), avatarImage.getHeight());
                RectF rectF = new RectF(rect);

                // 绘制
                canvas.drawARGB(0, 0, 0, 0);
                canvas.drawRoundRect(rectF, roundPx, roundPy, paint);
                paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
                canvas.drawBitmap(avatarImage, rect, rect, paint);

                avatarImage = targetBitmap;
            }
            else if (kBackgroundImage == key) {
                backgroundImage = bitmap;
            }
            else if (kQRCodeImage == key) {
                QRCodeImage = bitmap;
            }
            else if (kTagImage == key) {
                tagImage = bitmap;
            }

            if (0 == loadingDic.size()) {
                scale = 1.0;
                backgroundPoints = this.scalePoints(((String)this.templateInfo.get("background_image_xy")).split(","), scale);
                if (null != backgroundImage) {
                    scale = (double) backgroundImage.getWidth() / (double)backgroundPoints[2];
                    backgroundPoints = this.scalePoints(((String)this.templateInfo.get("background_image_xy")).split(","), scale);
                }
                goodsPoints = this.scalePoints(((String)this.templateInfo.get("goods_image_xy")).split(","), scale);
                tagPoints = this.scalePoints(((String)this.templateInfo.get("tag_image_xy")).split(","), scale);
                codePoints = this.scalePoints(((String)this.templateInfo.get("code_xy")).split(","), scale);
                ArrayList<Integer> points = new ArrayList<>();
                points.add((int)((double)(codePoints[0]) + 17.5 * scale));
                points.add((int)((double)(codePoints[1]) + 17.5 * scale));
                points.add((int)((double)(codePoints[2]) - 35 * scale));
                points.add((int)((double)(codePoints[3]) - 35 * scale));
                avatarPoints = new Integer[points.size()];
                points.toArray(avatarPoints);

                titlePoints = this.scalePoints(((String)this.templateInfo.get("goods_title_xy")).split(","), scale);
                titleFontSize = Double.parseDouble((String) this.templateInfo.get("goods_title_fontSize")) * scale;
                String goods_title_align = (String)this.templateInfo.get("goods_title_align");
                titleAlign = 1;
                if (goods_title_align.equals("right")) {
                    titleAlign = -1;
                }
                else if (goods_title_align.equals("center")) {
                    titleAlign = 0;
                }
                titleColor = this.getTextColor("goods_title_color");

                pricePoints = this.scalePoints(((String)this.templateInfo.get("goods_price_xy")).split(","), scale);
                priceFontSize = Double.parseDouble((String) this.templateInfo.get("goods_price_fontSize")) * scale;
                String goods_price_align = (String)this.templateInfo.get("goods_price_align");
                priceAlign = 1;
                if (goods_price_align.equals("right")) {
                    priceAlign = -1;
                }
                else if (goods_price_align.equals("center")) {
                    priceAlign = 0;
                }
                priceColor = this.getTextColor("goods_price_color");

                this.drawSingleGoods();
            }
        }
        else if (0 < goodsLoadingDic.size()) {
            Integer index = goodsLoadingDic.remove(url);

            Bitmap context = Bitmap.createBitmap( backgroundPoints[0] + backgroundPoints[2], backgroundPoints[1] + backgroundPoints[3], Bitmap.Config.ARGB_8888 );//创建一个新的和SRC长度宽度一样的位图
            Canvas cv = new Canvas( context );

            this.drawBitmap(cv, backgroundImage, backgroundPoints);
            this.drawBitmap(cv, bitmap, goodsPoints);
            this.drawBitmap(cv, tagImage, tagPoints);
            this.drawBitmap(cv, QRCodeImage, codePoints);
            this.drawBitmap(cv, avatarImage, avatarPoints);

            this.drawText(cv, title, (float) titleFontSize, titleColor, titleAlign, titlePoints);
            this.drawText(cv, price, (float) priceFontSize, priceColor, priceAlign, pricePoints);

            cv.save( Canvas.ALL_SAVE_FLAG );
            cv.restore();

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            context.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream .toByteArray();
            String imageBase64 = Base64.encodeToString(byteArray, Base64.DEFAULT);

            Map map = (Map) imagesURLStringInfo[index];
            map.put("imageBase64", "data:image/png;base64," + imageBase64);
            imagesURLStringInfo[index] = map;

            if (0 == goodsLoadingDic.size()) {
                callback.invoke("", this.toWritableArray(imagesURLStringInfo));
            }
        }
    }

    private void drawSingleGoods() {
        goodsLoadingDic = new HashMap<>();
        for (Integer index = 0; index < imagesURLStringInfo.length; index++) {
            // object structure:
            // [{"selected":true,"imageBase64":null,"imageString":"https://demo1.hixiaoqi.cn/uploads/goods_image/1525405667_tmp_cea42aa7414cca5e0e05e32bf1c5532d.png","key":0}]
            HashMap object = (HashMap) imagesURLStringInfo[index];
            Boolean selected = (Boolean) object.get("selected");
            if (selected) {
                String goodsURL = (String) object.get("imageString");
                goodsLoadingDic.put(goodsURL, index);
            }
        }

        HashMap<String, Integer> tmp = (HashMap<String, Integer>) goodsLoadingDic.clone();
        Iterator iterator = tmp.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry pair = (Map.Entry) iterator.next();
            Object key = pair.getKey();
            ImageCache.getInstanse(appContext).loadImages(this, (String) key, false);
        }
    }
}
