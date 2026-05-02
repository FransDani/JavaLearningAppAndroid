package com.example.finals_navarrofranchescadanielv_androidmanifest;
import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        WebView myView = (WebView) findViewById(R.id.webview);
        myView.setWebViewClient(new WebViewClient());
        myView.setWebChromeClient(new WebChromeClient());
        
        myView.getSettings().setJavaScriptEnabled(true);
        myView.getSettings().setDomStorageEnabled(true);
        myView.getSettings().setAllowFileAccess(true);
        myView.getSettings().setAllowContentAccess(true);
        myView.getSettings().setAllowFileAccessFromFileURLs(true);
        myView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        
        myView.loadUrl("file:///android_asset/java_index.html");
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}