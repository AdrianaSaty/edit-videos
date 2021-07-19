import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [importedVideo, setVideo] = useState();
  const [cutedVideo, setCutedVideo] = useState();
  const [logoVideo, setLogoVideo] = useState();
  const [finalVideo, setFinalVideo] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => {
    load();
  }, [])

  const cutVideo = async () => {
    console.log('-----> CUT VIDEO')
    console.log(importedVideo)
    // Write the file to memory 
    ffmpeg.FS('writeFile', 'importedVideo.mp4', await fetchFile(importedVideo));

    // Run the FFMpeg command
    // -i: import
    // -t: time duration
    // -ss: seach for position in seconds, can be also e [hh:mm:ss.xxx]
    // -f: format

    await ffmpeg.run(
      '-i', 'importedVideo.mp4',
      '-t', '2.5',
      '-ss', '10.0',
      '-f', 'mp4',
      'cutedVideo.mp4'
    );
    const data = ffmpeg.FS('readFile', 'cutedVideo.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setCutedVideo(url);
    setFinalVideo(url);
    await putLogoVideo();
  }

  const putLogoVideo = async () => {
    console.log('-----> PUT LOGO VIDEO')
    console.log(cutedVideo);

    await ffmpeg.FS('writeFile', 'cutedVideo.mp4', fetchFile(cutedVideo));

    await ffmpeg.run(
      '-i', 'cutedVideo.mp4',
      '--filter_complex', "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1,setsar=1,fps=30000/1001,format=yuv420p[intro];[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:-1:-1,setsar=1,fps=30000/1001,format=yuv420p[video];[2]scale=250:-1[logo];[0:a]aformat=sample_rates=48000:channel_layouts=stereo[introa];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[videoa];[intro][introa][video][videoa]concat=n=2:v=1:a=1[vid][a];[vid][logo]overlay=W-w-200:H-h-700[v]",
      'cutedVideo.mp4'
    );
    const data = ffmpeg.FS('readFile', 'cutedVideo.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setLogoVideo(url);
    setFinalVideo(url);
  }

  return ready ? (
    <div className="App">
      {importedVideo && <video
        controls
        width="400"
        src={URL.createObjectURL(importedVideo)}>
      </video>}
      <input type="file" onChange={(e) => setVideo(e.target.files?.item(0))} />
      <h3>Result</h3>
      <button onClick={cutVideo}>Faz a braba! </button>
      {finalVideo &&
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
