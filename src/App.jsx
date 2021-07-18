import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [importedVideo, setVideo] = useState();
  const [finalVideo, setFinalVideo] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => {
    load();
  }, [])

  const cutVideo = async () => {
    // Write the file to memory 
    ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(importedVideo));

    // Run the FFMpeg command
    // -i: import
    // -t: time duration
    // -ss: seach for position in seconds, can be also e [hh:mm:ss.xxx]
    // -f: format

    await ffmpeg.run(
      '-i', 'test.mp4', 
      '-t', '2.5', 
      '-ss', '10.0', 
      '-f', 'mp4', 'out.mp4');

    // Read the result
    const data = ffmpeg.FS('readFile', 'out.mp4');

    // Create a URL
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4'}));
    setFinalVideo(url)
  }

  return ready ? (
    
    <div className="App">
      { importedVideo && <video
        controls
        width="400"
        src={URL.createObjectURL(importedVideo)}>

      </video>}


      <input type="file" onChange={(e) => setVideo(e.target.files?.item(0))} />

      <h3>Result</h3>

      <button onClick={cutVideo}>Faz a braba! </button>

      { finalVideo && 
      <>
      <video controls width="400" src={finalVideo} />
      <a href={finalVideo} download>
        Download!
    </a>
      </>}

    </div>
  )
    :
    (
      <p>Loading...</p>
    );
}

export default App;
