document.addEventListener('DOMContentLoaded', function () {

  /**
  * Initialize channel
  * @param {string} _client - A string param
  */
  app.initialized().then(function (_client) {
    var client = _client;

    client.events.on('app.activated', function () {
      client.interface.trigger('showModal', {
        title: 'Bookmarklet',
        template: './views/bookmarks.html'
      }).then(null, function () {
        client.interface.trigger('showNotify', {
          type: 'error',
          message: 'Some error has occured in \'Bookmarklet app\'.'
        });
      });
    });
  },

  /**
   * This throws an error notification
   * @param {string} error -The string error message
  */
  function () {
    client.interface.trigger('showNotify', {
      type: 'error',
      message: 'Some error has occured in \'Bookmarklet app\'.'
    });
  });
});