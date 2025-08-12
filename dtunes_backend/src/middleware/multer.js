import multer from "multer";

//diskStorage: if no destination, stores in default temp files directory of pc, 

const storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
})

//memory storage: stores as buffer in memory

// const storage = multer.memoryStorage()


const upload = multer({storage})

export default upload;
