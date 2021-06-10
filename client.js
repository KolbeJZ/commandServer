const net = require('net')


   const client = net.createConnection({ port: 5000 }, () => {
    console.log("You're Connected to the server!");
client.setEncoding("utf-8");

  process.stdin.pipe(client);

  client.on('data', data => {
    if (data.toString() == `\nYou've been kicked out of the chat, sorry... \n`) {
        console.log(data.toString())
        client.end()
    }
    else console.log(data.toString())
})

  client.on("close", () => {
    console.log("Connection Closed");
  });
   });