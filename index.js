var app = require('express')();
//setting the server as express itself
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var session = require('express-session');
var port = process.env.PORT || 3000;
var count =1;
let nicknameArray = [];
let chatArray = [];
app.use(cookieParser());


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket){

    io.sockets.emit('getmessages', chatArray);
    socket.on('getUser', function (data) {
        console.error("THIS IS THE NICKNAME ARRAY " + nicknameArray)

        console.error("THIS IS THE COOKIE DATA" + data)
        if(data && nicknameArray.indexOf(data) == -1 ){
            socket.nickname = data;
            nicknameArray.push(socket.nickname)
            io.sockets.emit('printdefault', socket.nickname);
            console.error("first if")

        }
        else{
            console.error("seccond if")
            socket.nickname = "user" + nicknameArray.length;
            nicknameArray.push(socket.nickname);
            console.error("THIS IS THE NICKNAME ARRAY " + nicknameArray)
            io.sockets.emit('printdefault', socket.nickname);
        }

        io.sockets.emit('usernames', nicknameArray);
    });

    socket.on('change colour', function(data) {
        console.error("this is the data that we send" + data)
        //adding the socket name and the data
        if(socket.nickname.includes(`<font color=`)){
            console.error("WE ARE INSIDE OF THE COLORS")
            socket.nickname = socket.nickname.substring(20, socket.nickname.length -7 )
        }
        socket.nickname = `<font color=${data}>` + socket.nickname + `</font>`;
        console.error(socket.nickname)
    });

    socket.on('new user', function(data, callback){
        console.error("IN NEW USER this is a data " + data);
        if(data.includes(`<font color=`)){
            data = data.substring(17, socket.nickname.length -7 );
            console.error("THIS IS THE DATA NOW " + data);
        }

        if(nicknameArray.indexOf(data) != -1){
            console.error("false callbaaaackkk")
            callback(false);
        } else{

            if(socket.nickname.includes(`<font color=`)){
                console.error("SO THEN WE ARE IN THIS ONE")
                console.error("THIS IS THE SOCKET NICKNAME " + socket.nickname)
                var selectedColour = socket.nickname.substring(11,19);
                console.error(selectedColour)
                nicknameArray.splice(nicknameArray.indexOf(socket.nickname), 1);
                socket.nickname =`<font color${selectedColour}>` + data + `</font>`;
                console.error("THIS IS THE NICKNAME WITH NEW COLOR " + socket.nickname)
                // var nocolor = data.substring(18, socket.nickname.length -7 )

                nicknameArray.push(data);
                console.error("THIS IS THE NICKNAME ARRAY " + nicknameArray)
                io.sockets.emit('usernames', nicknameArray);
                callback(true);
            }
            else {
                console.error("WE ARE INSIDE OF THE ELSE CLAUSE")
                console.error(socket.nickname + "changing to " + data);
                nicknameArray.splice(nicknameArray.indexOf(socket.nickname), 1);
                socket.nickname = data;
                nicknameArray.push(socket.nickname);
                io.sockets.emit('usernames', nicknameArray);
                callback(true);

            }
            // io.sockets.emit('printdefault', socket.nickname);

        }

    });
    socket.on('disconnect', function(data){
        nicknameArray.splice(nicknameArray.indexOf(socket.nickname),1);
        io.sockets.emit('usernames', nicknameArray, socket.nickname);
        console.error( socket.nickname + "has left the chat")

    });

    socket.on('chat message', function(msg){
        let date = new Date();
        var hour = date.getHours();
        var minutes = date.getMinutes()

        var message = {"hour": hour,"minutes": minutes, "msg": msg, "nickname": socket.nickname};
        chatArray.push(message);
        io.emit('chat message',hour,minutes, msg, socket.nickname);
        // io.sockets.emit('printdefault', socket.nickname);


    });

});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
