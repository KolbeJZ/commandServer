const net = require('net')
const fs = require('fs')

let password = 'kolbe'
let clients = []
let newClientId = 1
fs.writeFile('./chat.log', '', () => {})
let server = net.createServer(client => {
    client.name = client.remoteAddress + client.remoteAddress 
    client.id = `Client-${newClientId}` 
    newClientId++ 
    clients.push(client) 
    fs.appendFile('./chat.log', `${client.id} has joined the chat. \n`, () => {})
    console.log('\n' + 'A new client has arrived.')
    console.log(`Number of clients: ${clients.length}` + '\n')

    broadcast(`${client.id} has joined the chat! \n`, client)
    
    client.write(`Type in "/help" to see valid commands`);
    client.write('\n' + 'You are connected as ' + client.id + '\n' + 'Welcome to the chatroom!' + '\n') 
 
    client.on('data', data => {
        let dataString = data.toString().replace(/\r?\n|\r/, '')
        let dataArray = dataString.split(' ')
        if (dataArray[0] == '/username' && !dataArray[1]) client.write('Not enough arguments. Try again.')
        else if (dataArray[0] == '/username' && dataArray[1]) {
            if (dataArray[2]) client.write(`You passed in too many arguments, try again.`)
            else if (client.id == dataArray[1]) client.write(`You're already using that username.`)
            else if (clients.filter(x => x.id == dataArray[1]).length > 0) client.write(`Someone else is using that username.`)
            else {
                client.write(`\nYour new username is ${dataArray[1]}. \n`)
                broadcast(`${client.id}'s new username is ${dataArray[1]}. \n`, client)
                fs.appendFile('./chat.log', `${client.id}'s new username is ${dataArray[1]}. \n`, () => {})
                client.id = dataArray[1]
            }
        } else if (dataArray[0] == '/clientlist') {
            if (dataArray[1]) {
                client.write('Too many arguments. Try again.')
            } else {
                clientList = clients.map(x => x.id).join(' ')
                client.write(clientList)
                fs.appendFile('chat.log', `${client.id} checked the clientlist.\n`, () => {})
            }
        } else if (dataArray[0] == "/kick") {
      removeName = dataArray[1];
      passwordAttempt = dataArray[2];
      if (removeName == client.id) {
        client.write(`You can't kick yourself.`);
        return;
      } else if (removeName == undefined || removeName == "") {
        client.write(`Please include someone to kick. `);
        return;
      }
      for (let i = 0; i < clients.length; i++) {
        if (removeName == clients[i].id) {
          if (passwordAttempt === password) {
            clients[i].write(`You have been kicked from the server.`);
            broadcast(`${removeName} has been kicked from the chat. \n`, client)
            // clients.splice(clients.indexOf(client), 1); 
            // console.log(`Number of clients: ${clients.length}` + '\n')
            clients[i].emit("end");
            fs.appendFile('./chat.log', `${removeName} has been kicked out of the chat. \n`, () => {})
            return;
          } else {
            client.write(`Your password was incorrect.`);
            return;
          }
        }
      }
      
      client.write(`Sorry, there isn't a user named "${removeName}"`);
     } else if (dataArray[0] == '/w') {
            if (!dataArray[2]) {
                client.write('Not enough Arguments. Try again.')
            } else {
                let reciever = clients.filter(x => x.id == dataArray[1])[0]
                if (!reciever) {
                    client.write('That username is not present in the chatroom.')
                } else if (client.id == reciever.id) {
                    client.write('Sending a message to yourself is pointless here.')
                } else {
                    message = dataArray.slice(2, dataArray.length).join(' ')
                    reciever.write(`Whisper from ${client.id}: ${message}\n`)
                    fs.appendFile('./chat.log', `Whisper from ${client.id} to ${reciever.id}: ${message}\n`, () => {})
                    // console.log(`Whisper from ${client.id} to ${reciever.id}: ${message}\n`)
                }
            }
        } else {
            broadcast(`\n${client.id}: ${dataString}\n`, client)
            fs.appendFile('./chat.log', `${client.id}: ${dataString}\n`, () => {})
        }
      
        if (dataArray[0] == "/help") {
            client.write(
              "COMMANDS: \n/w <username> <message> || Talk only to one other Client. \n"
            );
            client.write(
              "/username <new username> || Change your username to the whole chat. \n"
            );
            client.write(
              "/kick <username> <password> || Kick out one of the other clients. The password is kolbe \n"
            );
            client.write(
              "/clientlist || Get a list of all the other users in the chat. \n"
            );
            client.write(
              "/help || Get a list of all the commands you can run (It's this list right now!) \n\n"
            );
        }
      });
    
    

    // client.on('end', () => {
    //     broadcast(`${client.id} has left the chat. \n`, client)
    //     clients.splice(clients.indexOf(client), 1); 
    //     console.log(`Number of clients: ${clients.length}` + '\n')
    //     fs.appendFile('./chat.log', `${client.id} has left the chat. \n`, () => {})
    // })
    client.on("end", () => {
      console.log(`Disconnected: ${client.id}\n`);
      // console.log(`: ${clients.length}`);
      let idx = clients.indexOf(client);
      clients = clients.filter((clientSock) => clientSock != client);
      client.destroy();
      console.log(`Number of clients now: ${clients.length}`);
      for (let i = 0; i < clients.length; i++) {
        clients[i].write(`${client.id} Disconnected.`);
      }
      fs.appendFile('./chat.log', `${client.id} has left the chat. \n`, () => {})
    });

    function broadcast(message, sender) { 
        clients.forEach(x => {
            if (x === sender) return;
            x.write(message)
        })
        console.log(message)
    }
})

process.stdin.on('data', data => { 
    clients.forEach(x => {
        x.write(`Server: ${data}`)
    })
    fs.appendFile('./chat.log', `Server: ${data}`, () => {})
})

server.listen(5000, () => {
    console.log('Listening on port 5000')
})