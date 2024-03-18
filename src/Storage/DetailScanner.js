import React, { useRef, useState } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import Tesseract from 'tesseract.js';

const CardScanner = () => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const stopScan = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const captureImage = async () => {
    setLoading(true);

    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.src = canvas.toDataURL('image/png');

    stopScan();
    performOCR(image);
  };

  const performOCR = async (image) => {
    Tesseract.recognize(
      image,
      'eng',
      { 
        // logger: (info) => console.log(info), // Optional logger
        oem: 3 // Use OCR Engine Mode 3 to perform OCR without layout analysis
      }
    ).then(({ data: { text } }) => {
    //   console.log('Scanned Text:', text);
      
      // Extracting name, email, and phone from the scanned text
      const nameMatch = text.match(/[A-Za-z]+ [A-Za-z]+/);
      const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
      const phoneMatch = text.match(/\+?\d{2,3}[- ]?\d{5}[- ]?\d{5}/);

      const name = nameMatch ? nameMatch[0] : '';
      const email = emailMatch ? emailMatch[0] : '';
      const phone = phoneMatch ? phoneMatch[0] : '';

      // Update state with the extracted information
      setScannedData({ name, email, phone });
      setLoading(false);

      // Log extracted data to the console
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Phone:', phone);
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-top vw-100 vh-100">
      <div className="d-flex flex-column align-items-center mt-1">
        <video className='mt-1' ref={videoRef} style={{ height: 400, width: 450 }} autoPlay></video>
        <div className="d-flex justify-content-center mt-2 ">
          <button className="btn btn-primary m-1" onClick={startScan}>Start Scan</button>
          <button className="btn btn-primary m-1" onClick={captureImage}>Capture Image</button>
        </div>
      </div>
      <div className="ml-5">
        {loading && (
          <div className="text-center mt-3">
            <Spinner animation="border" variant="primary" />
            <p>Scanning...</p>
          </div>
        )}
        {scannedData && !loading && (
          <div className="mt-3">
            <h2 className="text-center">Scanned Details</h2>
            <Table className="table table-bordered table-info table-striped table-hover">
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>{scannedData.name}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>{scannedData.email}</td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td>{scannedData.phone}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardScanner;
