// === Vercel Configuration ===
// นำ URL ของ Google Apps Script (Web App) มาวางที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycbwPM4g6FMGKZAoqWDR7Ek3eDG1rsmqYYQ6ZDuSl24-PvdJ9Himgcmitbj7vE4JJqho/exec";

// Polyfill สำหรับจำลองการทำงานของ google.script.run
window.google = {
  script: {
    get run() {
      const runner = {
        _successCb: null,
        _failureCb: null,
        withSuccessHandler: function(cb) {
          this._successCb = cb;
          return this;
        },
        withFailureHandler: function(cb) {
          this._failureCb = cb;
          return this;
        }
      };
      
      return new Proxy(runner, {
        get(target, prop) {
          if (prop in target) return target[prop];
          
          return function(...args) {
            if (API_URL === "YOUR_GAS_WEBAPP_URL_HERE") {
              alert("กรุณาตั้งค่า API_URL ในไฟล์ config.js ก่อนใช้งาน");
              return;
            }
            
            fetch(API_URL, {
              method: 'POST',
              body: JSON.stringify({ action: prop, args: args })
            })
            .then(res => res.json())
            .then(data => {
              if (target._successCb) target._successCb(data);
            })
            .catch(err => {
              console.error("API Error:", err);
              if (target._failureCb) target._failureCb(err);
            });
          };
        }
      });
    }
  }
};
