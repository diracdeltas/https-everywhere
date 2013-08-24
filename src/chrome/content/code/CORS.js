const CORS = {
  setCorsHeaders: function(channel) {
    channel.setResponseHeader('Access-Control-Allow-Methods', 'POST,GET', true);
    channel.setResponseHeader('Access-Control-Allow-Origin', 'https://'+channel.URI.host, true);  
  }
}
