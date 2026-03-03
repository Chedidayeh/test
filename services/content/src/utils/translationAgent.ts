import * as deepl from 'deepl-node';

const authKey = process.env.DEEPL_API_KEY || "b7990e35-af18-449e-8d89-5c44eca0e21e:fx"
const deeplClient = new deepl.DeepLClient(authKey);

(async () => {
    const result = await deeplClient.translateText('Hello, world!', 'en', 'fr'); // Translates "Hello, world!" from English to French
    console.log(result.text);
})();