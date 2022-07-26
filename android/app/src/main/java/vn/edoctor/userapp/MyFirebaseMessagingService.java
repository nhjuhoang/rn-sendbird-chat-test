package vn.edoctor.userapp;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.rnsendbirdcalls.RNSendBirdCallsModule;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    @Override public void onMessageReceived(@NonNull RemoteMessage remoteMessage){
        RNSendBirdCallsModule.onMessageReceived(this.getApplicationContext(), remoteMessage.getData());
    }
    @Override public void onNewToken(@NonNull String token){
        RNSendBirdCallsModule.onNewToken(token);
    }
}