import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

import logo from './logo.png'

function App() {
  const [ready, setReady] = useState(false);
  const [importedVideo, setVideo] = useState();
  const [cutedVideo, setCutedVideo] = useState(undefined);
  const [logoVideo, setLogoVideo] = useState();
  const [finalVideo, setFinalVideo] = useState();
  const [clipping, setClipping] = useState(false) 

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(async()=>{
    await putLogoVideo(cutedVideo);
  },[cutedVideo])

  useEffect(() => {
    load();
  }, [])

  const cutVideo = async () => {
    setClipping(true)
    try {
      ffmpeg.FS('writeFile', 'importedVideo.mp4', await fetchFile(importedVideo));
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
    } catch (error) {
      setClipping(false)
    }
  }

  const putLogoVideo = async (video) => {
    try {
      ffmpeg.FS('writeFile', 'cuttedVideo.mp4', await fetchFile(video));
      ffmpeg.FS('writeFile', 'logo.png', await fetchFile(logo));
      await ffmpeg.run('-y',
        '-i', 'cuttedVideo.mp4',
        '-i','logo.png',
        '-filter_complex', "overlay=100:100",
        'logoVideo.mp4'
      );
      const data = ffmpeg.FS('readFile', 'logoVideo.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      setLogoVideo(url);
      setFinalVideo(url);
    } catch (error) {
      console.log(error)
    } finally {
      setClipping(false)
    }
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
      { clipping && <img src={"https://i.pinimg.com/originals/83/96/96/839696a3d8aa1e2321756d00f38a2af7.gif"}></img>}
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
