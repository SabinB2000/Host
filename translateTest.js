const translate = require('google-translate-api-x');

translate("Hello, how are you?", { from: "en", to: "ne" })
  .then(res => console.log("Translation Success:", res.text))
  .catch(err => console.error("Translation Error:", err));
