# Keep essential classes
-keep public class * extends android.app.Application
-keep public class com.facebook.react.* { *; }
-keep class com.facebook.soloader.* { *; }
-keep class android.webkit.WebView { *; }

# Keep annotations
-keepattributes *Annotation*

# Remove logging
-assumenosideeffects class android.util.Log { public static *** d(...); public static *** v(...); }
