require('dotenv').config();
const mongoose = require("mongoose");
const Doc = require("./Document")

const dbURI = process.env.DB_HOST;
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
.then(()=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.log(err);
})


const io = require("socket.io")(3001,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST']
    }
})

const defaultValue = "";

io.on("connection",socket=>{
    socket.on("get-document",async documentId=>{
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document',document.data);

        socket.on('send-changes',delta=>{
            socket.broadcast.to(documentId).emit("recieve-changes",delta);
        })

        socket.on("save-document",async data =>{
            await Doc.findByIdAndUpdate(documentId,{data});
        })
    })
})

async function findOrCreateDocument(id) {
    if(!id) return;

    const document = await Doc.findById(id);
    if(document) return document;
    return await Doc.create({_id:id,data:defaultValue});
}
