module.exports = {
    // testRegex: "test\\/.*-test\\.mjs$",

    // setupTestFrameworkScriptFile: "./std-esm-jest.js",

    collectCoverage: false,
    collectCoverageFrom: [
        "src/**/*.js",
        "!**/node_modules/**"
    ],
    coverageDirectory: "coverage/"
};
