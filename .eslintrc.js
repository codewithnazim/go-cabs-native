module.exports = {
    root: true,
    extends: '@react-native',
    rules: {
        // Quotes: Allow both single and double quotes without warnings
        quotes: ['off', 'double'],

        // Semicolons: Ignore semicolon usage
        semi: ['off', 'always'],

        // Trailing Commas: Ignore warnings related to trailing commas
        'comma-dangle': ['off'],

        // Ignore line spacing warnings
        'no-multiple-empty-lines': ['off'],

        // Disable spacing rules around brackets
        'object-curly-spacing': ['off'],

        // 🚫 Disable inline style warnings in React Native
        'react-native/no-inline-styles': 'off',
    },
};
