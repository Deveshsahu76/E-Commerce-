process.env.CI = "false";
process.env.GENERATE_SOURCEMAP = "false";
process.env.DISABLE_ESLINT_PLUGIN = "true";
process.env.ESLINT_NO_DEV_ERRORS = "true";

require("react-scripts/scripts/build");