module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
<<<<<<< HEAD
        moduleName: "@env",
        path: ".env",
        safe: true,
        allowUndefined: false,
      },
    ],
  ],
};
=======
        "moduleName": "@env",
        "path": ".env",
        "safe": true,
        "allowUndefined": false
      }
    ]
  ]
};
>>>>>>> feature/merge-prs
