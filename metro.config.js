const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { resolver: defaultResolver } = getDefaultConfig(__dirname);

const config = {
    transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'), // Add SVG transformer
    },
    resolver: {
        assetExts: defaultResolver.assetExts.filter(ext => ext !== 'svg'), // Exclude .svg from asset extensions
        sourceExts: [...defaultResolver.sourceExts, 'svg'],                // Add .svg to source extensions
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
