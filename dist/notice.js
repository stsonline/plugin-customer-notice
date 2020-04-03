function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  this.customerNotice = function () {

    // default plugin options
    var defaults = {
      api: {
        url: 'https://example.com/api/status',
        vendor: {
          url: 'https://example.com/api/forms/example'
        }
      },
      timeout: 70000,
      element: 'ptframe',
      theme: {
        color: '#924a8b'
      },
      tracking: {
        id: 'UA-XXXXXXXX-X',
        name: 'customerPlugin',
        title: 'Customer Plugin'
      },
      elsToRemove: ['']
    };


    // create options
    if (arguments[0] && _typeof(arguments[0]) === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    };


    // init variables with options
    var endpoint = this.options.api.url,
        endpointVendor = this.options.api.vendor.url,
        fetchTimeout = this.options.timeout,
        elPrepend = this.options.element,
        themeColor = this.options.theme.color,
        trackingID = this.options.tracking.id,
        trackingName = this.options.tracking.name,
        trackingTitle = this.options.tracking.title,
        elsToRemoveFromPage = this.options.elsToRemove


    // define hardcoded variables which can't be changed
    var tryToImportGa = 0,
        isGaAvailable = false


    // check if site Google Analytics is already loaded
    function isGaImportable() {
      if (typeof ga === 'function' || tryToImportGa++ > 3) {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        ga('create', trackingID, {'name':'customerNoticePlugin'});
        isGaAvailable = true;
      } else {
        setTimeout(isGaImportable, 500);
      }
    }


    // send reporting data
    function trackGaItem(title) {
      if (isGaAvailable) {
        ga(`${trackingName}.send`, "event", trackingTitle, title, "")
      }
    }


    // prototypes
    Element.prototype.appendBefore = function (element) {
      element.parentNode.insertBefore(this, element);
    },false;


    // hide the application
    function hideApplication(type) {
      if (document.getElementById(elPrepend)) {
        document.getElementById(elPrepend).style.display = 'none';
        document.getElementById(elPrepend).style.visibility = 'hidden';
        document.getElementById(elPrepend).style.opacity = '0';

        for (var element = 0; element < elsToRemoveFromPage.length; element++) {
          if (document.querySelector(elsToRemoveFromPage[element])) {
            let el = document.querySelector(elsToRemoveFromPage[element])
            el.parentNode.removeChild(el);
          }
        }

        // show third party application
        showThirdPartyApplication(type)
      }
    }


    // show third-party application
    function showThirdPartyApplication(cause) {
      var notice = document.createElement("div");
          notice.innerHTML = `<div id="customer-notice--plugin" style=
                              "text-align:center;font-family:sans-serif;font-weight:400;font-size:16px!important;max-width:767px;width:100%;margin:16px auto;line-height:1.7;">
                                <div style=
                                "padding:20px;margin:0 16px;border: 1px solid #f5f4f4;border-top:3px solid ${themeColor};background-color:#fbfbfb;">
                                  <iframe id="vendor-form" src='${endpointVendor}' width="100%" frameborder="0" scrolling="yes" style="min-height:1570px;overflow-y:auto;"></iframe>
                                </div>
                              </div>`;

      // inject the notice
      if (document.getElementById(elPrepend)) {
        var prependBefore = document.getElementById(elPrepend)
        notice.appendBefore(prependBefore);
          trackGaItem(`Customer notice triggered [showing third-party form] - reason: ${(cause != '') ? cause : 'not set'}`)
      }
    }


    // check system health
    function systemHealth(url) {
      var xhr = new XMLHttpRequest()
      xhr.addEventListener('error', noticeErr)

      xhr.open('GET', url, true)
      xhr.timeout = fetchTimeout
      xhr.ontimeout = function () {
        noticeErr('network')
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.response != null) {
          initNotice(JSON.parse(xhr.response))
        }
      }

      function initNotice(res) {
        if (res && res.online && res.customer_notice === true) {
          hideApplication('manual')
        }
      }

      function noticeErr(type) {
        hideApplication((type) ? type : 'down')
      }


      // plugin is loaded
      trackGaItem("Plugin loaded")
      xhr.send()
    }


    // decide whether to attempt system health check
    if (window.XMLHttpRequest) {
      isGaImportable()

      // check health
      systemHealth(endpoint)
    }


    // extend defaults
    function extendDefaults(source, properties) {
      var property;

      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }

      return source;
    }

  }
})();
