package com.kmlidc.RNShareLocal;
import android.app.ProgressDialog;
import android.content.ClipboardManager;
import android.content.Context;
import android.net.Uri;
import android.content.Intent;
import android.content.ComponentName;
import android.app.Activity;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;


import com.facebook.react.bridge.ActivityEventListener;

import android.os.AsyncTask;
import android.util.Base64;

import java.lang.String;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import java.io.File;
import java.io.FileOutputStream;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

/**
 * Created by yangbin on 2017/5/20.
 */

public class RNShareLocalManager extends ReactContextBaseJavaModule implements ActivityEventListener{
    private ReactApplicationContext reactContext;
    private Callback callback;

    final int SHARE_REQUEST = 500;

    public RNShareLocalManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addActivityEventListener(new RNShareLocalActivityEventListener());
    }

    @Override
    public String getName() {
        return "RNShareLocal";
    }
private class RNShareLocalActivityEventListener implements ActivityEventListener {
    public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
        if (requestCode == SHARE_REQUEST) {
            callback.invoke("success");
        }
    }
  /*  @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    } */
    public void onNewIntent(Intent intent) {
        
    }
}

    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }
    /*
   @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }*/

    public void onNewIntent(Intent intent) {
        
    }

    @ReactMethod
    public void message(String winTitle,String subject,String message,ReadableArray component, Callback callback) {
        this.callback = callback;

        Intent intent=new Intent(Intent.ACTION_SEND);
        intent.putExtra(Intent.EXTRA_SUBJECT,subject);
        intent.putExtra(Intent.EXTRA_TEXT,message);
        intent.setType("text/plain");

        Intent chooser = Intent.createChooser(intent, winTitle);
        chooser.addCategory(Intent.CATEGORY_DEFAULT);

        //是否指定App打开
        if(component != null && component.size() == 2) {
            intent.setComponent(new ComponentName(component.getString(0), component.getString(1)));
        }

        getCurrentActivity().startActivityForResult(chooser,SHARE_REQUEST);
    }

    @ReactMethod
    public void link(String winTitle,String subject,String url,ReadableArray component, Callback callback) {
        this.callback = callback;
        Intent intent=new Intent(Intent.ACTION_SEND);
        intent.putExtra(Intent.EXTRA_SUBJECT,subject);
        intent.putExtra(Intent.EXTRA_TEXT, url);
        intent.setType("text/html");

        Intent chooser = Intent.createChooser(intent, winTitle);
        chooser.addCategory(Intent.CATEGORY_DEFAULT);

        //是否指定App打开
        if(component != null && component.size() == 2) {
            intent.setComponent(new ComponentName(component.getString(0), component.getString(1)));
        }

        getCurrentActivity().startActivityForResult(chooser,SHARE_REQUEST);
    }

    @ReactMethod
    public void pictures(String winTitle,String subject,String message,ReadableArray imagesFile,ReadableArray component, Callback callback) {
        this.callback = callback;
        ArrayList<Uri> uris = new ArrayList<Uri>();
        for(int i=0; i<imagesFile.size();i++){
            uris.add(Uri.parse(imagesFile.getString(i)));
        }
        Intent intent=new Intent(Intent.ACTION_SEND_MULTIPLE);
        intent.putExtra(Intent.EXTRA_SUBJECT,subject);
        intent.putExtra(Intent.EXTRA_TEXT, message);
        intent.putExtra(Intent.EXTRA_STREAM, uris);
        intent.putExtra ("Kdescription", message);
        intent.setType("image/*");

        Intent chooser = Intent.createChooser(intent, winTitle);
        chooser.addCategory(Intent.CATEGORY_DEFAULT);

        //是否指定App打开
        if(component != null && component.size() == 2) {
            intent.setComponent(new ComponentName(component.getString(0), component.getString(1)));
        }


        ClipboardManager cmb = (ClipboardManager)(getCurrentActivity().getSystemService(Context.CLIPBOARD_SERVICE));
        cmb.setText(message.trim());
        getCurrentActivity().startActivityForResult(chooser,SHARE_REQUEST);
    }

    @ReactMethod
    public void downloadImage(final ReadableArray imagesUrl, final Promise promise){
        final ProgressDialog dialog = new ProgressDialog(getCurrentActivity());
        dialog.setTitle("分享");
        dialog.setMessage("加载中……文字已复制，分享朋友圈时请粘贴");
        dialog.setCancelable(false);
        dialog.show();

        new AsyncTask<Void, Void, JSONArray>() {
            @Override
            protected JSONArray doInBackground(Void... voids) {
                List<String> paths = new ArrayList<String>();
                for(int i=0; i<imagesUrl.size();i++){
                    String imageUrl = imagesUrl.getString(i);
                    String prefix = "data:image/png;base64,";
                    String fileName = i + ".jpg";
                    if (imageUrl.startsWith(prefix)) {
                        String base64 = imageUrl.substring(prefix.length(), imageUrl.length());
                        byte[] decodedString = Base64.decode(base64, Base64.DEFAULT);
                        String path = save(decodedString, fileName);
                        paths.add(path);
                    }
                    else {
                        String path = download(imageUrl, fileName);
                        paths.add(path);
                    }
                }
                JSONArray array = new JSONArray(paths);
                return array;
            }
            protected void onPostExecute(JSONArray array) {
                promise.resolve(array.toString());
                super.onPostExecute(array);

                dialog.dismiss();
            }
        }.execute();
    }

    //下载图片并保存
    public String download( String imageUrl, String fileName) {
        final String savePath = getReactApplicationContext().getExternalCacheDir() + "/" + fileName;
        try {
            File f = new File(savePath);
            File dir = f.getParentFile();
            if(!dir.exists())
                dir.mkdirs();
            FileOutputStream os = new FileOutputStream(f);
            byte[] data = getImage(imageUrl);
            os.write(data);
            os.close();
        } catch (Exception e) {
            e.getLocalizedMessage();
        }

        return "file://" + savePath;
    }

    //本地图片
    public String save(byte[] data, String fileName) {
        final String savePath = getReactApplicationContext().getExternalCacheDir() + "/" + fileName;
        try {
            File f = new File(savePath);
            File dir = f.getParentFile();
            if(!dir.exists())
                dir.mkdirs();
            FileOutputStream os = new FileOutputStream(f);
            os.write(data);
            os.close();
        } catch (Exception e) {
            e.getLocalizedMessage();
        }
        return "file://" + savePath;
    }

    /*
    * 获取网络图片
    */
    public byte[] getImage(String imageUrl) throws Exception{
        URL url = new URL(imageUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(5 * 1000);
        conn.setRequestMethod("GET");
        InputStream inStream = conn.getInputStream();
        if(conn.getResponseCode() == HttpURLConnection.HTTP_OK){
            return readStream(inStream);
        }
        return null;
    }


    /*
    获取图片流数据
     */
    public static byte[] readStream(InputStream inStream) throws Exception{
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int len = 0;
        while( (len=inStream.read(buffer)) != -1){
            outStream.write(buffer, 0, len);
        }
        outStream.close();
        inStream.close();
        return outStream.toByteArray();
    }
}