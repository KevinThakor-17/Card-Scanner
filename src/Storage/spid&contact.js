import React, { useRef, useState } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import Tesseract from 'tesseract.js';

const BusinessCardScanner = () => {
  const videoRef = useRef(null);
  const [scannedSPID, setScannedSPID] = useState('');
  const [scannedContact, setScannedContact] = useState('');
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
        logger: (info) => console.log(info), // Optional logger
        oem: 3 // Use OCR Engine Mode 3 to perform OCR without layout analysis
      }
    ).then(({ data: { text } }) => {
      console.log('Scanned Text:', text);
      const lines = text.split('\n');
      let spid = '';
      let contact = '';
      // Extract SPID and Contact information from the scanned text
      for (let line of lines) {
        if (line.toLowerCase().includes('spid')) {
          spid = line.replace('SPID:', '').trim(); // Remove 'SPID:' and trim spaces
          spid = spid.match(/\d+/)[0]; // Extract only the numeric part
        }
        if (line.toLowerCase().includes('contact')) {
          contact = line.replace('Contact:', '').trim(); // Remove 'Contact:' and trim spaces
          // Remove any non-numeric characters
          contact = contact.replace(/\D/g, '');
        }
      }
      setScannedSPID(spid); // Set the scanned SPID to state
      setScannedContact(contact); // Set the scanned Contact information to state
      setLoading(false);
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-top vw-80 vh-80 bg-secondary border border-dark rounded">
      <div className="d-flex flex-column align-items-center mt-1 ms-2">
        <video className='mt-1 border' ref={videoRef} style={{ height: 400, width: 450 }} autoPlay></video>
        <div className="d-flex justify-content-center mt-2 ">
          <button className="btn btn-primary m-1" onClick={startScan}>Start Scan</button>
          <button className="btn btn-primary m-1" onClick={captureImage}>Capture Image</button>
        </div>
      </div>
      <div style={{marginLeft:10}} className="">
        {loading && (
          <div className="text-center mt-3">
            <Spinner animation="border" variant="primary" />
            <p>Scanning...</p>
          </div>
        )}
        {(scannedSPID || scannedContact) && !loading && (
          <div className="mt-3">
            <h2 className="text-center">Scanned Details</h2>
            <Table className="table table-bordered table-dark table-striped table-hover">
              <tbody>
                {scannedSPID && (
                  <tr>
                    <td>SPID: {scannedSPID}</td>
                  </tr>
                )}
                {scannedContact && (
                  <tr>
                    <td>Contact: {scannedContact}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCardScanner;
