import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, saveToS3} from './util/util';

const validateUrl = require('valid-url');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get("/filteredimage", async (req, res) => {
    const url : string = req.query.image_url;
    const toBeSavedInS3 : boolean = req.query.save;
    if(!url || !validateUrl.isUri(url)) {
      return res.status(400).send("Image URL is invalid.");
    }
    const outputPath = await filterImageFromURL(url);
    if(!outputPath) {
      return res.status(400).send("Error in downloading file.");
    }
    if(toBeSavedInS3) {
      const savedUrl = await saveToS3(outputPath);
      deleteLocalFiles([outputPath]);
      if(savedUrl) {
        return res.status(200).send(savedUrl);
      } else {
        return res.status(500).send("File save failed");
      }
    }
    return res.sendFile(outputPath, (err) => {
      if(!err) {
        deleteLocalFiles([outputPath]);
      }
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();