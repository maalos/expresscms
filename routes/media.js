module.exports = function(app, fs, isAdmin, upload, exec, sizeOf) {
    app.post('/upload-image', isAdmin, upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }
    
        const imageName = `img_${Date.now()}`;
        const imagePathTmp = `./public/images/posts/tmp/${imageName}.${req.file.mimetype.split('/')[1]}`;
        const imagePathWebp = `./public/images/posts/${imageName}.webp`;
    
        fs.writeFileSync(imagePathTmp, req.file.buffer);
    
        const cwebpCommand = `cwebp -q 70 ${imagePathTmp} -o ${imagePathWebp}`;
        exec(cwebpCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error converting image to WebP:', error);
                return res.status(500).json({ error: 'Error converting image to WebP.' });
            }
    
            fs.rmSync(imagePathTmp);
    
            sizeOf(imagePathWebp, function (error, dimensions) {
                if (error)
                    console.error(error)
    
                res.json({ imageName, width: dimensions.width, height: dimensions.height });
            });
        });
    });
}