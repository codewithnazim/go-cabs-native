// const fs = require("fs");
// const path = require("path");

// // Path to the React Native Xcode script
// const scriptPath = path.join(
//   __dirname,
//   "..",
//   "node_modules",
//   "react-native",
//   "scripts",
//   "react-native-xcode.sh",
// );

// try {
//   // Read the file
//   let content = fs.readFileSync(scriptPath, "utf8");

//   // Check if the file contains the problematic line
//   if (content.includes('echo "$IP" > "$DEST/ip.txt"')) {
//     // Replace the line with an alternative that uses a runtime directory
//     // Instead of writing to the app bundle, write to a temporary location
//     const modified = content.replace(
//       'echo "$IP" > "$DEST/ip.txt"',
//       "# Original line commented out to fix iOS physical device builds\n" +
//         '# echo "$IP" > "$DEST/ip.txt"\n' +
//         "# IP information will be handled at runtime instead",
//     );

//     // Write the modified content back to the file
//     fs.writeFileSync(scriptPath, modified, "utf8");
//     console.log("✅ Successfully patched React Native Xcode script");
//   } else {
//     console.log("ℹ️ React Native Xcode script already patched or up to date");
//   }
// } catch (error) {
//   console.error("❌ Error patching React Native Xcode script:", error);
// }
